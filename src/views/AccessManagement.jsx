// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ApartmentOutlined as OrgIcon,
  DeveloperBoardOutlined as SolutionIcon,
  FolderOpenOutlined as WorkspaceIcon,
  PlayArrowOutlined as RunnerIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ResourceTreeItem, ScopeFilterButtons, UserHeaderBadges } from 'src/components/AccessManagement';
import { APP_ROLES } from 'src/services/config/accessControl/Roles.js';
import { useSaveAclAssignments } from 'src/state/accessManagement/hooks.js';
import {
  ROLE_OPTIONS,
  buildAclOperation,
  buildResourceKey,
  buildSaveErrorMessage,
  computeEffectiveAssignments,
  findExplicitAclEntry,
  getAssignedRolesCountFromPermissions,
  getFallbackRoleFromSecurity,
  getLinkedSolutionId,
  getRoleFromUserPermissions,
  getUserIdentifiers,
  hasWriteSecurityPermission,
  normalizeRole,
} from 'src/state/accessManagement/assignmentUtils.js';
import { ASSIGNABLE_RESOURCE_TYPES } from 'src/state/accessManagement/constants.js';
import { useFetchInitialData } from 'src/state/app/hooks.js';
import { useUserRoles } from 'src/state/auth/hooks.js';
import { useOrganizationsList } from 'src/state/organizations/hooks.js';
import { useRunnersList } from 'src/state/runners/hooks.js';
import { useSolutionsList } from 'src/state/solutions/hooks.js';
import { USERS_STATUS } from 'src/state/users/constants.js';
import { useFetchRealmUsers, useUsersList, useUsersListStatus } from 'src/state/users/hooks.js';
import { useWorkspacesList } from 'src/state/workspaces/hooks.js';
import { getAvatarColor, getInitials } from 'src/utils/AvatarUtils.js';
import { matchesSearchQuery } from 'src/utils/SearchUtils.js';

const getRoleLabelText = (t, role) => t(`accessManagement.roles.${normalizeRole(role)}`);

export const AccessManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const amColors = theme.palette.accessManagement || {};
  const avatarColors = amColors.avatarColors;
  const avatarFallbackColor = amColors.avatarFallbackBg || theme.palette.secondary.dark;

  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [resourceSearchScope, setResourceSearchScope] = useState('organizations');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [draftAssignments, setDraftAssignments] = useState({});
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuResourceKey, setMenuResourceKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const users = useUsersList();
  const usersStatus = useUsersListStatus();
  const organizations = useOrganizationsList();
  const solutions = useSolutionsList();
  const workspaces = useWorkspacesList();
  const runners = useRunnersList();
  const userRoles = useUserRoles();

  const fetchInitialData = useFetchInitialData();
  const fetchRealmUsers = useFetchRealmUsers();
  const saveAclAssignments = useSaveAclAssignments();

  const isPlatformAdmin = userRoles?.includes(APP_ROLES.PlatformAdmin) === true;

  const clearTransientState = useCallback(() => {
    setDraftAssignments({});
    setMenuAnchorEl(null);
    setMenuResourceKey(null);
    setSaveError(null);
    setSaveSuccess(null);
  }, []);

  // ---------------------------------------------------------------------------
  // User list logic
  // ---------------------------------------------------------------------------

  const displayUsers = useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) return [];
    return users.map((user, index) => ({
      ...user,
      id: user.id || user.username || user.email || `user-${index}`,
      name:
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.username ||
        user.email ||
        'Unknown User',
      email: user.email || '',
      username: user.username || '',
    }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return displayUsers;
    return displayUsers.filter((user) =>
      matchesSearchQuery(userSearchQuery, user.id, user.name, user.email, user.username)
    );
  }, [displayUsers, userSearchQuery]);

  const currentUser = useMemo(() => {
    if (filteredUsers.length === 0) return null;
    if (selectedUserId == null) return filteredUsers[0];
    return filteredUsers.find((user) => user.id === selectedUserId) || filteredUsers[0];
  }, [filteredUsers, selectedUserId]);

  const previousUserIdRef = useRef(null);
  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    const currentUserId = currentUser?.id ?? null;
    if (previousUserId && currentUserId && previousUserId !== currentUserId) clearTransientState();
    previousUserIdRef.current = currentUserId;
  }, [clearTransientState, currentUser?.id]);

  // ---------------------------------------------------------------------------
  // Resource tree logic
  // ---------------------------------------------------------------------------

  const orgTree = useMemo(() => {
    if (!Array.isArray(organizations) || organizations.length === 0) return [];

    return organizations.map((organization) => {
      const orgSolutions = (solutions || []).filter((solution) => solution.organizationId === organization.id);

      const orgWorkspaces = (workspaces || [])
        .filter((workspace) => workspace.organizationId === organization.id)
        .map((workspace) => {
          const workspaceSolutionId = getLinkedSolutionId(workspace);
          const workspaceRunners = (runners || [])
            .filter(
              (runner) =>
                runner.organizationId === organization.id &&
                runner.workspaceId === workspace.id &&
                String(runner.type || 'RUNNER').toUpperCase() !== 'RUN'
            )
            .map((runner) => ({
              ...runner,
              name: runner.name || runner.id,
              type: runner.type || 'RUNNER',
              solutionId: runner.solution?.solutionId ?? runner.solutionId ?? workspaceSolutionId ?? null,
            }));

          return {
            ...workspace,
            name: workspace.name || workspace.id,
            solutionId: workspaceSolutionId,
            runners: workspaceRunners,
          };
        });

      return {
        ...organization,
        name: organization.name || organization.id,
        solutions: orgSolutions,
        workspaces: orgWorkspaces,
      };
    });
  }, [organizations, runners, solutions, workspaces]);

  const filteredOrgTree = useMemo(() => {
    if (!resourceSearchQuery) return orgTree;

    if (resourceSearchScope === 'organizations') {
      return orgTree.filter((organization) =>
        matchesSearchQuery(resourceSearchQuery, organization.name, organization.id)
      );
    }

    if (resourceSearchScope === 'solutions') {
      return orgTree
        .map((organization) => {
          const matchedSolutions = (organization.solutions || []).filter((solution) =>
            matchesSearchQuery(resourceSearchQuery, solution.name, solution.id)
          );
          if (matchedSolutions.length === 0) return null;
          return { ...organization, solutions: matchedSolutions, workspaces: [] };
        })
        .filter(Boolean);
    }

    if (resourceSearchScope === 'workspaces') {
      return orgTree
        .map((organization) => {
          const matchedWorkspaces = (organization.workspaces || []).filter((workspace) =>
            matchesSearchQuery(resourceSearchQuery, workspace.name, workspace.id)
          );
          if (matchedWorkspaces.length === 0) return null;
          return { ...organization, workspaces: matchedWorkspaces };
        })
        .filter(Boolean);
    }

    return orgTree
      .map((organization) => {
        const matchedWorkspaces = (organization.workspaces || [])
          .map((workspace) => {
            const matchedRunners = (workspace.runners || []).filter((runner) =>
              matchesSearchQuery(resourceSearchQuery, runner.name, runner.id)
            );
            if (matchedRunners.length === 0) return null;
            return { ...workspace, runners: matchedRunners };
          })
          .filter(Boolean);

        if (matchedWorkspaces.length === 0) return null;
        return { ...organization, workspaces: matchedWorkspaces, solutions: [] };
      })
      .filter(Boolean);
  }, [orgTree, resourceSearchQuery, resourceSearchScope]);

  // ---------------------------------------------------------------------------
  // Assignment model logic
  // ---------------------------------------------------------------------------

  const resourceViewModels = useMemo(() => {
    if (!currentUser) return [];

    const userIdentifiers = getUserIdentifiers(currentUser);
    const preferredIdentityId = currentUser.email || currentUser.username || currentUser.id || null;

    const models = [];

    for (const organization of orgTree) {
      const organizationExplicitAcl = findExplicitAclEntry(organization.security, userIdentifiers);
      const organizationBaseRole =
        getRoleFromUserPermissions(currentUser, 'organizations', organization.id) ||
        getFallbackRoleFromSecurity(organization.security, currentUser);

      models.push({
        resourceKey: buildResourceKey('organizations', organization.id),
        resourceType: 'organizations',
        resourceId: organization.id,
        organizationId: organization.id,
        workspaceId: null,
        solutionId: null,
        runnerId: null,
        baseRole: normalizeRole(organizationBaseRole),
        effectiveRole: normalizeRole(organizationBaseRole),
        draftSource: null,
        hasExplicitAccess: Boolean(organizationExplicitAcl),
        explicitIdentityId: organizationExplicitAcl?.id || null,
        preferredIdentityId,
        canAssign:
          ASSIGNABLE_RESOURCE_TYPES.has('organizations') &&
          (isPlatformAdmin || hasWriteSecurityPermission(organization)),
      });

      for (const solution of organization.solutions || []) {
        const solutionExplicitAcl = findExplicitAclEntry(solution.security, userIdentifiers);
        const solutionBaseRole =
          getRoleFromUserPermissions(currentUser, 'solutions', solution.id) ||
          getFallbackRoleFromSecurity(solution.security, currentUser);

        models.push({
          resourceKey: buildResourceKey('solutions', solution.id),
          resourceType: 'solutions',
          resourceId: solution.id,
          organizationId: solution.organizationId ?? organization.id,
          workspaceId: null,
          solutionId: solution.id,
          runnerId: null,
          baseRole: normalizeRole(solutionBaseRole),
          effectiveRole: normalizeRole(solutionBaseRole),
          draftSource: null,
          hasExplicitAccess: Boolean(solutionExplicitAcl),
          explicitIdentityId: solutionExplicitAcl?.id || null,
          preferredIdentityId,
          canAssign:
            ASSIGNABLE_RESOURCE_TYPES.has('solutions') && (isPlatformAdmin || hasWriteSecurityPermission(solution)),
        });
      }

      for (const workspace of organization.workspaces || []) {
        const workspaceExplicitAcl = findExplicitAclEntry(workspace.security, userIdentifiers);
        const workspaceBaseRole =
          getRoleFromUserPermissions(currentUser, 'workspaces', workspace.id) ||
          getFallbackRoleFromSecurity(workspace.security, currentUser);

        models.push({
          resourceKey: buildResourceKey('workspaces', workspace.id),
          resourceType: 'workspaces',
          resourceId: workspace.id,
          organizationId: workspace.organizationId ?? organization.id,
          workspaceId: workspace.id,
          solutionId: workspace.solutionId,
          runnerId: null,
          baseRole: normalizeRole(workspaceBaseRole),
          effectiveRole: normalizeRole(workspaceBaseRole),
          draftSource: null,
          hasExplicitAccess: Boolean(workspaceExplicitAcl),
          explicitIdentityId: workspaceExplicitAcl?.id || null,
          preferredIdentityId,
          canAssign:
            ASSIGNABLE_RESOURCE_TYPES.has('workspaces') && (isPlatformAdmin || hasWriteSecurityPermission(workspace)),
        });

        for (const runner of workspace.runners || []) {
          const runnerExplicitAcl = findExplicitAclEntry(runner.security, userIdentifiers);
          const runnerBaseRole =
            getRoleFromUserPermissions(currentUser, 'runners', runner.id) ||
            getFallbackRoleFromSecurity(runner.security, currentUser);

          models.push({
            resourceKey: buildResourceKey('runners', runner.id),
            resourceType: 'runners',
            resourceId: runner.id,
            organizationId: runner.organizationId ?? workspace.organizationId ?? organization.id,
            workspaceId: runner.workspaceId ?? workspace.id,
            solutionId: runner.solutionId ?? workspace.solutionId ?? null,
            runnerId: runner.id,
            baseRole: normalizeRole(runnerBaseRole),
            effectiveRole: normalizeRole(runnerBaseRole),
            draftSource: null,
            hasExplicitAccess: Boolean(runnerExplicitAcl),
            explicitIdentityId: runnerExplicitAcl?.id || null,
            preferredIdentityId,
            canAssign:
              ASSIGNABLE_RESOURCE_TYPES.has('runners') && (isPlatformAdmin || hasWriteSecurityPermission(runner)),
          });
        }
      }
    }

    return models;
  }, [currentUser, isPlatformAdmin, orgTree]);

  const resourceModelByKey = useMemo(() => {
    return new Map(resourceViewModels.map((model) => [model.resourceKey, model]));
  }, [resourceViewModels]);

  const effectiveAssignments = useMemo(() => {
    return computeEffectiveAssignments(resourceViewModels, draftAssignments);
  }, [draftAssignments, resourceViewModels]);

  const hasDrafts = useMemo(() => {
    return Object.values(effectiveAssignments).some((assignment) => assignment.isDraft);
  }, [effectiveAssignments]);

  const autoDraftCount = useMemo(() => {
    return Object.values(effectiveAssignments).filter((assignment) => assignment.draftSource === 'auto').length;
  }, [effectiveAssignments]);

  const assignedRolesCount = useMemo(() => {
    return Object.values(effectiveAssignments).filter(
      (assignment) => normalizeRole(assignment.effectiveRole) !== 'none'
    ).length;
  }, [effectiveAssignments]);

  const pendingOperations = useMemo(() => {
    const operations = [];
    for (const resourceModel of resourceViewModels) {
      const assignment = effectiveAssignments[resourceModel.resourceKey];
      if (!assignment || !assignment.isDraft) continue;
      const operation = buildAclOperation(resourceModel, assignment.effectiveRole);
      if (operation) operations.push(operation);
    }
    return operations;
  }, [effectiveAssignments, resourceViewModels]);

  // ---------------------------------------------------------------------------
  // Assignment data accessor
  // ---------------------------------------------------------------------------

  const getResourceAssignmentData = useCallback(
    (resourceType, resourceId) => {
      const resourceKey = buildResourceKey(resourceType, resourceId);
      const assignment = effectiveAssignments[resourceKey];
      const resourceModel = resourceModelByKey.get(resourceKey);

      const effectiveRole = normalizeRole(assignment?.effectiveRole || resourceModel?.baseRole || 'none');
      const isDraft = assignment?.isDraft === true;
      const isAutoDraft = assignment?.draftSource === 'auto';
      const isDirectDraft = assignment?.draftSource === 'direct';
      const canAssign = Boolean(resourceModel?.canAssign);

      const roleLabel =
        effectiveRole === 'none'
          ? null
          : isAutoDraft
            ? `${getRoleLabelText(t, effectiveRole)} ${t('accessManagement.draft')}`
            : getRoleLabelText(t, effectiveRole);

      return {
        resourceKey: resourceModel?.resourceKey ?? null,
        roleLabel,
        isDraft,
        isAutoDraft,
        isDirectDraft,
        canAssign,
      };
    },
    [effectiveAssignments, resourceModelByKey, t]
  );

  // ---------------------------------------------------------------------------
  // Role menu handlers
  // ---------------------------------------------------------------------------

  const handleOpenRoleMenu = useCallback((event, resourceKey) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuResourceKey(resourceKey);
    setSaveError(null);
    setSaveSuccess(null);
  }, []);

  const handleCloseRoleMenu = useCallback(() => {
    setMenuAnchorEl(null);
    setMenuResourceKey(null);
  }, []);

  const handleRoleSelect = useCallback(
    (role) => {
      if (!menuResourceKey) return;

      const resourceModel = resourceModelByKey.get(menuResourceKey);
      if (!resourceModel) return;

      const selectedRole = normalizeRole(role);
      setDraftAssignments((previousDrafts) => {
        const nextDrafts = { ...previousDrafts };
        if (selectedRole === normalizeRole(resourceModel.baseRole)) {
          delete nextDrafts[menuResourceKey];
        } else {
          nextDrafts[menuResourceKey] = {
            role: selectedRole,
            source: 'direct',
            touchedAt: Date.now(),
          };
        }
        return nextDrafts;
      });

      setSaveError(null);
      setSaveSuccess(null);
      handleCloseRoleMenu();
    },
    [handleCloseRoleMenu, menuResourceKey, resourceModelByKey]
  );

  const handleDiscardDrafts = useCallback(() => {
    clearTransientState();
  }, [clearTransientState]);

  // ---------------------------------------------------------------------------
  // Save handler (delegates to Redux thunk)
  // ---------------------------------------------------------------------------

  const handleValidateAll = useCallback(async () => {
    if (!hasDrafts || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      await saveAclAssignments(pendingOperations);

      clearTransientState();
      setSaveSuccess(t('accessManagement.assignSaveSuccess'));

      await fetchInitialData();
      try {
        await fetchRealmUsers();
      } catch (error) {
        console.warn('[AccessManagement] Unable to refresh realm users after ACL update:', error);
      }
    } catch (error) {
      setSaveError(buildSaveErrorMessage(t('accessManagement.assignSaveError'), error));
    } finally {
      setIsSaving(false);
    }
  }, [
    clearTransientState,
    fetchInitialData,
    fetchRealmUsers,
    hasDrafts,
    isSaving,
    pendingOperations,
    saveAclAssignments,
    t,
  ]);

  const menuCurrentRole = useMemo(() => {
    if (!menuResourceKey) return null;
    return normalizeRole(
      effectiveAssignments[menuResourceKey]?.effectiveRole ||
        resourceModelByKey.get(menuResourceKey)?.baseRole ||
        'none'
    );
  }, [effectiveAssignments, menuResourceKey, resourceModelByKey]);

  // ---------------------------------------------------------------------------
  // Shared styles
  // ---------------------------------------------------------------------------

  const searchFieldSx = {
    minWidth: 260,
    '& .MuiOutlinedInput-root': {
      bgcolor: amColors.searchBg || theme.palette.background.surface,
      borderRadius: 1.25,
      minHeight: 34,
      fontSize: '0.86rem',
      fontFamily: amColors.fontFamily || theme.typography.fontFamily,
      color: theme.palette.text.primary,
      '& fieldset': { borderColor: amColors.searchBorder || theme.palette.divider },
      '&:hover fieldset': { borderColor: amColors.searchHoverBorder || theme.palette.divider },
      '&.Mui-focused fieldset': { borderColor: theme.palette.secondary.main },
    },
    '& .MuiInputBase-input': {
      py: 0.9,
    },
    '& .MuiInputBase-input::placeholder': {
      color: amColors.searchPlaceholder || theme.palette.text.secondary,
      opacity: 1,
    },
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        color: amColors.pageText || theme.palette.text.primary,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <LockIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.2rem' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: amColors.title || theme.palette.text.primary }}>
            {t('accessManagement.title')}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: amColors.subtitle || theme.palette.text.secondary }}>
          {t('accessManagement.subtitle')}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr auto' },
          alignItems: 'start',
          columnGap: 2,
          rowGap: 1.1,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder={t('accessManagement.searchUserPlaceholder')}
          value={userSearchQuery}
          onChange={(event) => setUserSearchQuery(event.target.value)}
          sx={{
            ...searchFieldSx,
            width: { xs: '100%', md: 340 },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ fontSize: '1rem', color: amColors.searchPlaceholder || theme.palette.text.secondary }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box
          sx={{
            display: 'grid',
            justifyItems: { xs: 'start', lg: 'end' },
            gap: 0.65,
            width: { xs: '100%', lg: 460 },
            justifySelf: { xs: 'stretch', lg: 'end' },
          }}
        >
          <ScopeFilterButtons value={resourceSearchScope} onChange={setResourceSearchScope} t={t} theme={theme} />

          <TextField
            size="small"
            placeholder={t('accessManagement.searchResourcePlaceholder')}
            value={resourceSearchQuery}
            onChange={(event) => setResourceSearchQuery(event.target.value)}
            sx={{
              ...searchFieldSx,
              width: '100%',
              justifySelf: { xs: 'stretch', lg: 'end' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ fontSize: '1rem', color: amColors.searchPlaceholder || theme.palette.text.secondary }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* Users panel */}
        <Box
          sx={{
            borderRadius: 2,
            border: `1px solid ${amColors.panelBorder || theme.palette.divider}`,
            bgcolor: amColors.panelBg || theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              px: 2,
              pt: 1.5,
              pb: 1,
              fontWeight: 700,
              letterSpacing: 1.6,
              color: amColors.usersHeaderText || theme.palette.text.secondary,
              fontSize: '0.7rem',
              borderBottom: `1px solid ${amColors.usersHeaderBorder || theme.palette.divider}`,
            }}
          >
            {t('accessManagement.usersLabel')}
          </Typography>

          <List sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
            {usersStatus === USERS_STATUS.LOADING && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {filteredUsers.map((user) => {
              const isSelected = currentUser?.id === user.id;
              const userAssignedRolesCount = getAssignedRolesCountFromPermissions(user);

              return (
                <ListItem
                  key={user.id}
                  disablePadding
                  sx={{ borderBottom: `1px solid ${amColors.userRowBorder || theme.palette.divider}` }}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedUserId(user.id)}
                    sx={{
                      py: 1.25,
                      px: 1.75,
                      '&.Mui-selected': {
                        bgcolor: amColors.selectedUserBg || theme.palette.action.selected,
                        borderLeft: `2px solid ${theme.palette.secondary.main}`,
                        '&:hover': {
                          bgcolor: amColors.selectedUserHoverBg || theme.palette.action.selected,
                        },
                      },
                      '&:hover': {
                        bgcolor: amColors.userRowHoverBg || theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 42 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: getAvatarColor(user.name, avatarColors, avatarFallbackColor),
                          color: amColors.avatarText || theme.palette.secondary.light,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                      slotProps={{
                        primary: {
                          sx: {
                            fontSize: '0.93rem',
                            fontWeight: isSelected ? 600 : 450,
                            color: amColors.userNameText || theme.palette.text.primary,
                          },
                        },
                        secondary: {
                          sx: {
                            fontSize: '0.76rem',
                            color: amColors.userEmailText || theme.palette.text.secondary,
                          },
                        },
                      }}
                    />

                    {userAssignedRolesCount > 0 && (
                      <Box
                        sx={{
                          minWidth: 22,
                          height: 22,
                          px: 0.8,
                          borderRadius: '999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: amColors.countChipBg || theme.palette.background.surfaceVariant,
                          color: amColors.countChipText || theme.palette.secondary.main,
                          fontWeight: 600,
                          fontSize: '0.76rem',
                        }}
                      >
                        {userAssignedRolesCount}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Resource panel */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            border: `1px solid ${amColors.panelBorder || theme.palette.divider}`,
            bgcolor: amColors.panelBg || theme.palette.background.paper,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {currentUser ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                  px: 2.25,
                  py: 1.8,
                  borderBottom: `1px solid ${amColors.resourceHeaderBorder || theme.palette.divider}`,
                  bgcolor: amColors.panelHeaderBg || theme.palette.background.paper,
                }}
              >
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: getAvatarColor(currentUser.name, avatarColors, avatarFallbackColor),
                    color: amColors.avatarText || theme.palette.secondary.light,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  }}
                >
                  {getInitials(currentUser.name)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      color: amColors.userNameText || theme.palette.text.primary,
                      lineHeight: 1.05,
                    }}
                  >
                    {currentUser.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: amColors.userEmailText || theme.palette.text.secondary, fontSize: '0.9rem' }}
                  >
                    {currentUser.email}
                  </Typography>
                </Box>

                <UserHeaderBadges user={currentUser} assignedRolesCount={assignedRolesCount} t={t} theme={theme} />
              </Box>

              <Box
                sx={{ flex: 1, overflowY: 'auto', p: 1.6, bgcolor: amColors.panelBg || theme.palette.background.paper }}
              >
                {filteredOrgTree.length > 0 ? (
                  filteredOrgTree.map((organization) => {
                    const organizationAssignment = getResourceAssignmentData('organizations', organization.id);

                    return (
                      <ResourceTreeItem
                        key={organization.id}
                        icon={<OrgIcon fontSize="small" />}
                        name={organization.name}
                        type="ORGANIZATION"
                        itemCount={(organization.solutions?.length || 0) + (organization.workspaces?.length || 0)}
                        depth={0}
                        assignLabel={t('accessManagement.assign')}
                        roleLabel={organizationAssignment.roleLabel}
                        isDraft={organizationAssignment.isDraft}
                        isAutoDraft={organizationAssignment.isAutoDraft}
                        isDirectDraft={organizationAssignment.isDirectDraft}
                        canAssign={organizationAssignment.canAssign}
                        isSaving={isSaving}
                        onAssignClick={handleOpenRoleMenu}
                        resourceKey={organizationAssignment.resourceKey}
                        theme={theme}
                      >
                        {(organization.solutions || []).map((solution) => {
                          const solutionAssignment = getResourceAssignmentData('solutions', solution.id);

                          return (
                            <ResourceTreeItem
                              key={solution.id}
                              icon={<SolutionIcon fontSize="small" />}
                              name={solution.name || solution.id}
                              type="SOLUTION"
                              depth={1}
                              assignLabel={t('accessManagement.assign')}
                              roleLabel={solutionAssignment.roleLabel}
                              isDraft={solutionAssignment.isDraft}
                              isAutoDraft={solutionAssignment.isAutoDraft}
                              isDirectDraft={solutionAssignment.isDirectDraft}
                              canAssign={solutionAssignment.canAssign}
                              isSaving={isSaving}
                              onAssignClick={handleOpenRoleMenu}
                              resourceKey={solutionAssignment.resourceKey}
                              theme={theme}
                            />
                          );
                        })}

                        {(organization.workspaces || []).map((workspace) => {
                          const workspaceAssignment = getResourceAssignmentData('workspaces', workspace.id);

                          return (
                            <ResourceTreeItem
                              key={workspace.id}
                              icon={<WorkspaceIcon fontSize="small" />}
                              name={workspace.name || workspace.id}
                              type="WORKSPACE"
                              itemCount={workspace.runners?.length || workspace.itemCount}
                              depth={1}
                              assignLabel={t('accessManagement.assign')}
                              roleLabel={workspaceAssignment.roleLabel}
                              isDraft={workspaceAssignment.isDraft}
                              isAutoDraft={workspaceAssignment.isAutoDraft}
                              isDirectDraft={workspaceAssignment.isDirectDraft}
                              canAssign={workspaceAssignment.canAssign}
                              isSaving={isSaving}
                              onAssignClick={handleOpenRoleMenu}
                              resourceKey={workspaceAssignment.resourceKey}
                              theme={theme}
                            >
                              {(workspace.runners || []).map((runner) => {
                                const runnerType = String(runner.type || 'RUNNER').toUpperCase();
                                const runnerAssignment = getResourceAssignmentData('runners', runner.id);

                                return (
                                  <ResourceTreeItem
                                    key={`${workspace.id}-${runner.id}`}
                                    icon={<RunnerIcon fontSize="small" />}
                                    name={runner.name || runner.id}
                                    type={runnerType}
                                    depth={2}
                                    assignLabel={t('accessManagement.assign')}
                                    roleLabel={runnerAssignment.roleLabel}
                                    isDraft={runnerAssignment.isDraft}
                                    isAutoDraft={runnerAssignment.isAutoDraft}
                                    isDirectDraft={runnerAssignment.isDirectDraft}
                                    canAssign={runnerAssignment.canAssign}
                                    isSaving={isSaving}
                                    onAssignClick={handleOpenRoleMenu}
                                    resourceKey={runnerAssignment.resourceKey}
                                    theme={theme}
                                  />
                                );
                              })}
                            </ResourceTreeItem>
                          );
                        })}
                      </ResourceTreeItem>
                    );
                  })
                ) : (
                  <Box sx={{ px: 2, py: 2 }}>
                    <Typography variant="body2" sx={{ color: amColors.subtitle || theme.palette.text.secondary }}>
                      {t('accessManagement.noResourcesMatch')}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Footer: alerts + action bar */}
              <Box sx={{ px: 2, pb: 1.5 }}>
                {saveError && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 1,
                      bgcolor: amColors.inlineErrorBg,
                      border: `1px solid ${amColors.inlineErrorBorder}`,
                      color: amColors.inlineErrorText,
                    }}
                  >
                    {saveError}
                  </Alert>
                )}

                {saveSuccess && (
                  <Alert
                    severity="success"
                    sx={{
                      mb: hasDrafts ? 1 : 0,
                      bgcolor: amColors.inlineSuccessBg,
                      border: `1px solid ${amColors.inlineSuccessBorder}`,
                      color: amColors.inlineSuccessText,
                    }}
                  >
                    {saveSuccess}
                  </Alert>
                )}

                {hasDrafts && (
                  <Box
                    sx={{
                      borderRadius: 1.5,
                      border: `1px solid ${amColors.footerBorder || theme.palette.divider}`,
                      bgcolor: amColors.footerBg || theme.palette.background.surface,
                      px: 2,
                      py: 1.2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: amColors.footerText || theme.palette.text.secondary }}>
                      {t('accessManagement.autoAssignedRolesSummary', { count: autoDraftCount })}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleValidateAll}
                        disabled={isSaving}
                        sx={{
                          bgcolor: amColors.footerPrimaryBg || theme.palette.secondary.main,
                          color: amColors.footerPrimaryText || theme.palette.secondary.contrastText,
                          '&:hover': {
                            bgcolor: amColors.footerPrimaryHoverBg || theme.palette.secondary.dark,
                          },
                        }}
                      >
                        {t('accessManagement.validateAll')}
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleDiscardDrafts}
                        disabled={isSaving}
                        sx={{
                          bgcolor: amColors.footerSecondaryBg || theme.palette.background.surfaceVariant,
                          color: amColors.footerSecondaryText || theme.palette.text.secondary,
                          '&:hover': {
                            bgcolor: amColors.footerSecondaryHoverBg || theme.palette.action.hover,
                          },
                        }}
                      >
                        {t('accessManagement.discard')}
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Typography variant="body2" sx={{ color: amColors.subtitle || theme.palette.text.secondary }}>
                {t('accessManagement.selectUser')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Role selection menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl && menuResourceKey)}
        onClose={handleCloseRoleMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: 126,
            bgcolor: amColors.menuBg || theme.palette.background.paper,
            border: `1px solid ${amColors.menuBorder || theme.palette.divider}`,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        {ROLE_OPTIONS.map((role) => {
          const normalizedRole = normalizeRole(role);
          const selected = normalizedRole === menuCurrentRole;
          return (
            <MenuItem
              key={role}
              selected={selected}
              onClick={() => handleRoleSelect(normalizedRole)}
              sx={{
                fontSize: '0.86rem',
                color: theme.palette.text.primary,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.16),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.24),
                  },
                },
              }}
            >
              {getRoleLabelText(t, normalizedRole)}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};
