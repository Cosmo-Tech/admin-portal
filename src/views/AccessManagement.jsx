// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { Children, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  ApartmentOutlined as OrgIcon,
  DeveloperBoardOutlined as SolutionIcon,
  FolderOpenOutlined as WorkspaceIcon,
  PlayArrowOutlined as RunnerIcon,
  HubOutlined as RunIcon,
  Search as SearchIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  ChevronRightRounded as ChevronRightIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useOrganizationsList } from 'src/state/organizations/hooks.js';
import { useRunnersList } from 'src/state/runners/hooks.js';
import { useSolutionsList } from 'src/state/solutions/hooks.js';
import { USERS_STATUS } from 'src/state/users/constants.js';
import { useUsersList, useUsersListStatus } from 'src/state/users/hooks.js';
import { useWorkspacesList } from 'src/state/workspaces/hooks.js';

const DEFAULT_AVATAR_COLORS = ['#6B4A1E', '#725024', '#7A5828', '#81602D', '#896833', '#917238'];
const DEFAULT_TREE_ICON_COLORS = {
  ORGANIZATION: '#FF9F1C',
  SOLUTION: '#3FA4FF',
  WORKSPACE: '#14C97A',
  RUNNER: '#A6ACB5',
  RUN: '#9098A3',
};

const normalizeSearchValue = (value) => (value == null ? '' : String(value)).toLowerCase();

const getStableNumber = (value, maxExclusive) => {
  if (maxExclusive <= 0) return 0;
  const normalized = normalizeSearchValue(value);
  if (!normalized) return 0;

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % maxExclusive;
};

const getAvatarColor = (name, avatarColors) => {
  const paletteColors = avatarColors?.length > 0 ? avatarColors : DEFAULT_AVATAR_COLORS;
  if (!name) return paletteColors[0];
  return paletteColors[getStableNumber(name, paletteColors.length)];
};

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

const matchesSearchQuery = (query, ...values) => {
  const normalizedQuery = normalizeSearchValue(query).trim();
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
};

const getAssignedRolesCountForUser = (user) => {
  const resourcePermissions = user?.resourcePermissions;
  if (!resourcePermissions) return 0;

  const permissionScopes = ['organizations', 'solutions', 'workspaces', 'runners'];
  return permissionScopes.reduce((total, scope) => {
    const scopedPermissions = Object.values(resourcePermissions[scope] ?? {});
    const assignedInScope = scopedPermissions.filter((permission) => {
      const role = permission?.role;
      return typeof role === 'string' && role.toLowerCase() !== 'none';
    }).length;
    return total + assignedInScope;
  }, 0);
};

const formatRoleLabel = (role) => {
  if (!role || typeof role !== 'string') return '';
  return role
    .toLowerCase()
    .split(/[\s_.-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getRoleChipStyle = (role, theme) => {
  const normalizedRole = String(role || '')
    .toLowerCase()
    .trim();

  if (normalizedRole === 'admin') {
    return {
      bgcolor: alpha('#FF9F1C', 0.18),
      color: theme.palette.mode === 'dark' ? '#FFD08A' : '#B45309',
      border: `1px solid ${alpha('#FF9F1C', 0.45)}`,
    };
  }
  if (normalizedRole === 'editor' || normalizedRole === 'validator') {
    return {
      bgcolor: alpha('#3B82F6', 0.18),
      color: theme.palette.mode === 'dark' ? '#BFDBFE' : '#1D4ED8',
      border: `1px solid ${alpha('#3B82F6', 0.45)}`,
    };
  }
  if (normalizedRole === 'viewer') {
    return {
      bgcolor: alpha('#7A869A', 0.18),
      color: theme.palette.mode === 'dark' ? '#D5DCE7' : '#4B5563',
      border: `1px solid ${alpha('#7A869A', 0.45)}`,
    };
  }
  return {
    bgcolor: alpha('#7A869A', 0.18),
    color: theme.palette.mode === 'dark' ? '#D5DCE7' : '#4B5563',
    border: `1px solid ${alpha('#7A869A', 0.45)}`,
  };
};

const ResourceTreeItem = ({ icon, name, type, itemCount, depth = 0, children, theme, assignLabel, role }) => {
  const [expanded, setExpanded] = useState(type === 'ORGANIZATION' || type === 'WORKSPACE');
  const amColors = theme.palette.accessManagement || {};
  const treeIconColors = amColors.treeIconColors || DEFAULT_TREE_ICON_COLORS;

  const hasChildren = Children.count(children) > 0;
  const hasRole = typeof role === 'string' && role.toLowerCase() !== 'none';
  const roleLabel = hasRole ? formatRoleLabel(role) : null;
  const roleChipStyle = hasRole ? getRoleChipStyle(role, theme) : null;
  const connectorLeft = 24 + (depth - 1) * 36;
  const itemType = type || 'RUNNER';
  const iconColor = treeIconColors[itemType] || amColors.resourceItemSubtext || theme.palette.text.secondary;

  return (
    <Box sx={{ position: 'relative', mb: 0.85 }}>
      {depth > 0 && (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: connectorLeft,
              width: '1px',
              bgcolor: amColors.connector || theme.palette.divider,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: connectorLeft,
              width: 18,
              height: '1px',
              bgcolor: amColors.connector || theme.palette.divider,
            }}
          />
        </>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1.05,
          px: 1.5,
          pl: 1.5 + depth * 4.5,
          borderRadius: 1.35,
          border: `1px solid ${amColors.resourceItemBorder || '#CFD4DB'}`,
          bgcolor: amColors.resourceItemBg || theme.palette.background.paper,
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          cursor: hasChildren ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: amColors.resourceItemHoverBg || theme.palette.action.hover,
            borderColor: amColors.resourceItemHoverBorder || '#BEC6CF',
          },
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <IconButton
            size="small"
            sx={{ mr: 0.75, p: 0.2, color: amColors.resourceItemChevron || theme.palette.text.secondary }}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        )}
        <Box
          sx={{
            color: iconColor,
            mr: 1.25,
            display: 'flex',
            alignItems: 'center',
            '& svg': { fontSize: '1.05rem' },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: amColors.resourceItemText || theme.palette.text.primary,
              lineHeight: 1.25,
              fontSize: '0.97rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: amColors.resourceItemSubtext || theme.palette.text.secondary,
              fontSize: '0.66rem',
              letterSpacing: 0.75,
              textTransform: 'uppercase',
            }}
          >
            {itemType}
            {itemCount != null && ` · ${itemCount} items`}
          </Typography>
        </Box>
        {roleLabel && (
          <Chip
            label={roleLabel}
            size="small"
            sx={{
              ml: 1,
              height: 28,
              fontWeight: 600,
              fontSize: '0.74rem',
              ...roleChipStyle,
            }}
          />
        )}
        <Button
          variant="outlined"
          size="small"
          sx={{
            ml: 1,
            minWidth: 76,
            borderRadius: 2,
            borderColor: amColors.assignButtonBorder || theme.palette.divider,
            borderStyle: 'dashed',
            color: amColors.assignButtonText || theme.palette.text.secondary,
            fontSize: '0.8rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              color: '#FFB752',
              bgcolor: alpha(theme.palette.secondary.main, 0.08),
            },
          }}
        >
          {assignLabel}
        </Button>
      </Box>
      {hasChildren && <Collapse in={expanded}>{children}</Collapse>}
    </Box>
  );
};

ResourceTreeItem.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  itemCount: PropTypes.number,
  depth: PropTypes.number,
  children: PropTypes.node,
  assignLabel: PropTypes.string.isRequired,
  role: PropTypes.string,
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
  }).isRequired,
};

export const AccessManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const amColors = theme.palette.accessManagement || {};
  const avatarColors = amColors.avatarColors || DEFAULT_AVATAR_COLORS;
  const accentColor = amColors.accent || theme.palette.secondary.main;
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [resourceSearchScope, setResourceSearchScope] = useState('organizations');
  const [selectedUser, setSelectedUser] = useState(null);

  const users = useUsersList();
  const usersStatus = useUsersListStatus();
  const organizations = useOrganizationsList();
  const solutions = useSolutionsList();
  const workspaces = useWorkspacesList();
  const runners = useRunnersList();

  const searchFieldSx = {
    minWidth: 260,
    '& .MuiOutlinedInput-root': {
      bgcolor: amColors.searchBg || theme.palette.background.paper,
      borderRadius: 1.5,
      fontSize: '0.82rem',
      color: theme.palette.text.primary,
      '& fieldset': { borderColor: amColors.searchBorder || theme.palette.divider },
      '&:hover fieldset': { borderColor: amColors.searchHoverBorder || theme.palette.divider },
      '&.Mui-focused fieldset': { borderColor: `${amColors.searchFocusBorder || accentColor} !important` },
    },
    '& .MuiInputBase-input::placeholder': {
      color: amColors.searchPlaceholder || theme.palette.text.secondary,
      opacity: 1,
    },
  };

  const displayUsers = useMemo(() => {
    if (users && users.length > 0) {
      return users.map((u, index) => ({
        id: u.id || u.username || u.email || `user-${index}`,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || 'Unknown User',
        email: u.email || '',
        username: u.username || '',
        isPlatformAdmin: Boolean(u.isPlatformAdmin),
        resourcePermissions: u.resourcePermissions,
      }));
    }
    return [];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return displayUsers;
    return displayUsers.filter((u) => matchesSearchQuery(userSearchQuery, u.id, u.name, u.email, u.username));
  }, [displayUsers, userSearchQuery]);

  const currentUser = useMemo(() => {
    if (filteredUsers.length === 0) return null;
    if (selectedUser == null) return filteredUsers[0];
    return filteredUsers.find((u) => u.id === selectedUser.id) || filteredUsers[0];
  }, [filteredUsers, selectedUser]);

  // Build resource tree from real state
  const orgTree = useMemo(() => {
    if (organizations && organizations.length > 0) {
      return organizations.map((org) => {
        const orgSolutions =
          solutions
            ?.filter((solution) => solution.organizationId === org.id)
            .map((solution) => ({
              ...solution,
              name: solution.name || solution.id,
            })) || [];
        const orgWorkspaces =
          workspaces
            ?.filter((ws) => ws.organizationId === org.id)
            .map((ws) => ({
              ...ws,
              name: ws.name || ws.id,
              runners:
                runners
                  ?.filter((runner) => runner.organizationId === org.id && runner.workspaceId === ws.id)
                  .map((runner) => ({
                    ...runner,
                    name: runner.name || runner.id,
                  })) || [],
            })) || [];
        return {
          ...org,
          name: org.name || org.id,
          solutions: orgSolutions,
          workspaces: orgWorkspaces,
        };
      });
    }
    return [];
  }, [organizations, solutions, workspaces, runners]);

  const filteredOrgTree = useMemo(() => {
    if (!resourceSearchQuery) return orgTree;

    if (resourceSearchScope === 'organizations') {
      return orgTree.filter((org) => matchesSearchQuery(resourceSearchQuery, org.name, org.id));
    }

    if (resourceSearchScope === 'workspaces') {
      return orgTree
        .map((org) => {
          const matchedWorkspaces = (org.workspaces || []).filter((ws) =>
            matchesSearchQuery(resourceSearchQuery, ws.name, ws.id)
          );
          if (matchedWorkspaces.length === 0) return null;
          return { ...org, workspaces: matchedWorkspaces };
        })
        .filter(Boolean);
    }

    if (resourceSearchScope === 'solutions') {
      return orgTree
        .map((org) => {
          const matchedSolutions = (org.solutions || []).filter((solution) =>
            matchesSearchQuery(resourceSearchQuery, solution.name, solution.id)
          );
          if (matchedSolutions.length === 0) return null;
          return { ...org, solutions: matchedSolutions, workspaces: [] };
        })
        .filter(Boolean);
    }

    if (resourceSearchScope === 'runners') {
      return orgTree
        .map((org) => {
          const matchedWorkspaces = (org.workspaces || [])
            .map((ws) => {
              const matchedRunners = (ws.runners || []).filter((runner) => {
                const runnerType = String(runner.type || 'RUNNER').toUpperCase();
                return runnerType !== 'RUN' && matchesSearchQuery(resourceSearchQuery, runner.name, runner.id);
              });
              if (matchedRunners.length === 0) return null;
              return { ...ws, runners: matchedRunners };
            })
            .filter(Boolean);

          if (matchedWorkspaces.length === 0) return null;
          return { ...org, workspaces: matchedWorkspaces, solutions: [] };
        })
        .filter(Boolean);
    }

    return orgTree
      .map((org) => {
        const matchedWorkspaces = (org.workspaces || [])
          .map((ws) => {
            const matchedRunners = (ws.runners || []).filter((runner) =>
              matchesSearchQuery(resourceSearchQuery, runner.name, runner.id)
            );
            if (matchedRunners.length === 0) return null;
            return { ...ws, runners: matchedRunners };
          })
          .filter(Boolean);

        if (matchedWorkspaces.length === 0) return null;
        return { ...org, workspaces: matchedWorkspaces };
      })
      .filter(Boolean);
  }, [orgTree, resourceSearchQuery, resourceSearchScope]);

  const assignedRolesCount = getAssignedRolesCountForUser(currentUser);
  const selectedUserResourcePermissions = currentUser?.resourcePermissions || {};
  const getCurrentUserRoleForResource = (resourceType, resourceId) => {
    const role = selectedUserResourcePermissions?.[resourceType]?.[resourceId]?.role;
    return typeof role === 'string' ? role : null;
  };

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
      {/* Header */}
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

      {/* Toolbar: User Search + Resource Search */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder={t('accessManagement.searchUserPlaceholder')}
          value={userSearchQuery}
          onChange={(e) => setUserSearchQuery(e.target.value)}
          sx={{ ...searchFieldSx, flex: { xs: '1 1 100%', md: '0 1 340px' } }}
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

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            flex: { xs: '1 1 100%', md: '0 1 auto' },
          }}
        >
          <ToggleButtonGroup
            value={resourceSearchScope}
            exclusive
            onChange={(_, v) => v && setResourceSearchScope(v)}
            size="small"
            sx={{
              bgcolor: 'transparent',
              borderRadius: 1.5,
              gap: 0.75,
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontSize: '0.8rem',
                px: 1.4,
                py: 0.4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.55,
                borderRadius: 1.2,
                bgcolor: amColors.toggleBg || theme.palette.background.surface,
                border: `1px solid ${amColors.toggleBorder || theme.palette.divider} !important`,
                color: amColors.toggleText || theme.palette.text.secondary,
                '& .scopeIcon': {
                  fontSize: '0.95rem',
                },
                '&:hover': {
                  bgcolor: amColors.toggleHoverBg || theme.palette.action.hover,
                  borderColor: `${amColors.toggleHoverBorder || theme.palette.divider} !important`,
                },
                '&.Mui-selected': {
                  bgcolor: `${amColors.toggleSelectedBg || alpha(theme.palette.secondary.main, 0.18)} !important`,
                  borderColor: `${amColors.toggleSelectedBorder || accentColor} !important`,
                  color: `${amColors.toggleSelectedText || theme.palette.secondary.main} !important`,
                  fontWeight: 600,
                  boxShadow: `inset 0 0 0 1px ${amColors.toggleSelectedBorder || accentColor}`,
                },
                '&.Mui-selected:hover': {
                  bgcolor: `${amColors.toggleSelectedHoverBg || alpha(theme.palette.secondary.main, 0.24)} !important`,
                },
              },
              '& .MuiToggleButtonGroup-grouped': {
                margin: 0,
                borderRadius: '10px !important',
              },
            }}
          >
            <ToggleButton value="organizations">
              <OrgIcon className="scopeIcon" />
              {t('accessManagement.resourceScope.organizations')}
            </ToggleButton>
            <ToggleButton value="solutions">
              <SolutionIcon className="scopeIcon" />
              {t('accessManagement.resourceScope.solutions')}
            </ToggleButton>
            <ToggleButton value="workspaces">
              <WorkspaceIcon className="scopeIcon" />
              {t('accessManagement.resourceScope.workspaces')}
            </ToggleButton>
            <ToggleButton value="runners">
              <RunnerIcon className="scopeIcon" />
              {t('accessManagement.resourceScope.runners')}
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            size="small"
            placeholder={t('accessManagement.searchResourcePlaceholder')}
            value={resourceSearchQuery}
            onChange={(e) => setResourceSearchQuery(e.target.value)}
            sx={{ ...searchFieldSx, flex: { xs: '1 1 100%', md: '0 1 330px' } }}
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

      {/* Main Content: Users Panel + Resource Panel */}
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
        {/* Left Panel — Users List */}
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
            {usersStatus !== USERS_STATUS.LOADING && filteredUsers.length === 0 && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="body2" sx={{ color: amColors.subtitle || theme.palette.text.secondary }}>
                  {t('users.empty')}
                </Typography>
              </Box>
            )}
            {filteredUsers.map((user) => {
              const isSelected = currentUser?.id === user.id;
              const userAssignedRolesCount = getAssignedRolesCountForUser(user);
              return (
                <ListItem
                  key={user.id}
                  disablePadding
                  sx={{ borderBottom: `1px solid ${amColors.userRowBorder || theme.palette.divider}` }}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      py: 1.25,
                      px: 1.75,
                      '&.Mui-selected': {
                        bgcolor: amColors.selectedUserBg || theme.palette.action.selected,
                        borderLeft: `2px solid ${accentColor}`,
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
                          bgcolor: getAvatarColor(user.name, avatarColors),
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
                      <Chip
                        label={userAssignedRolesCount}
                        size="small"
                        sx={{
                          height: 22,
                          minWidth: 22,
                          borderRadius: '999px',
                          bgcolor: amColors.countChipBg || theme.palette.background.surfaceVariant,
                          color: amColors.countChipText || theme.palette.secondary.main,
                          fontWeight: 600,
                          '& .MuiChip-label': { px: 0.8 },
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Right Panel — Resource Tree */}
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
              {/* User Header */}
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
                    bgcolor: getAvatarColor(currentUser.name, avatarColors),
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
                <Chip
                  label={currentUser.isPlatformAdmin ? 'Platform Admin' : t('users.role.user')}
                  size="small"
                  sx={{
                    bgcolor: currentUser.isPlatformAdmin ? alpha('#FF9F1C', 0.18) : alpha('#7A869A', 0.18),
                    color: currentUser.isPlatformAdmin
                      ? theme.palette.mode === 'dark'
                        ? '#FFD08A'
                        : '#B45309'
                      : theme.palette.mode === 'dark'
                        ? '#D5DCE7'
                        : '#4B5563',
                    border: `1px solid ${currentUser.isPlatformAdmin ? alpha('#FF9F1C', 0.45) : alpha('#7A869A', 0.45)}`,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 28,
                  }}
                />
                <Chip
                  label={`${assignedRolesCount} ${t('accessManagement.assignedRoles')}`}
                  size="small"
                  sx={{
                    bgcolor: amColors.assignedRolesChipBg || theme.palette.background.surfaceVariant,
                    color: amColors.assignedRolesChipText || theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: 28,
                  }}
                />
              </Box>

              {/* Resource Tree */}
              <Box
                sx={{ flex: 1, overflowY: 'auto', p: 1.6, bgcolor: amColors.panelBg || theme.palette.background.paper }}
              >
                {filteredOrgTree.length > 0 ? (
                  filteredOrgTree.map((org) => (
                    <ResourceTreeItem
                      key={org.id}
                      icon={<OrgIcon fontSize="small" />}
                      name={org.name}
                      type="ORGANIZATION"
                      itemCount={(org.solutions?.length || 0) + (org.workspaces?.length || 0)}
                      depth={0}
                      assignLabel={t('accessManagement.assign')}
                      role={getCurrentUserRoleForResource('organizations', org.id)}
                      color={amColors.organizationIcon || theme.palette.primary.main}
                      theme={theme}
                    >
                      {(org.solutions || []).map((sol) => (
                        <ResourceTreeItem
                          key={sol.id}
                          icon={<SolutionIcon fontSize="small" />}
                          name={sol.name}
                          type="SOLUTION"
                          depth={1}
                          assignLabel={t('accessManagement.assign')}
                          role={getCurrentUserRoleForResource('solutions', sol.id)}
                          theme={theme}
                        />
                      ))}
                      {(org.workspaces || []).map((ws) => (
                        <ResourceTreeItem
                          key={ws.id}
                          icon={<WorkspaceIcon fontSize="small" />}
                          name={ws.name}
                          type="WORKSPACE"
                          itemCount={ws.runners?.length || ws.itemCount}
                          depth={1}
                          assignLabel={t('accessManagement.assign')}
                          role={getCurrentUserRoleForResource('workspaces', ws.id)}
                          theme={theme}
                        >
                          {(ws.runners || []).map((runner) => (
                            <ResourceTreeItem
                              key={runner.id}
                              icon={
                                runner.type === 'RUN' ? <RunIcon fontSize="small" /> : <RunnerIcon fontSize="small" />
                              }
                              name={runner.name}
                              type={runner.type || 'RUNNER'}
                              depth={2}
                              assignLabel={t('accessManagement.assign')}
                              role={getCurrentUserRoleForResource('runners', runner.id)}
                              theme={theme}
                            />
                          ))}
                        </ResourceTreeItem>
                      ))}
                    </ResourceTreeItem>
                  ))
                ) : (
                  <Box sx={{ px: 2, py: 2 }}>
                    <Typography variant="body2" sx={{ color: amColors.subtitle || theme.palette.text.secondary }}>
                      {t('accessManagement.noResourcesMatch')}
                    </Typography>
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
    </Box>
  );
};
