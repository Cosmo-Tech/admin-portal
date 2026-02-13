// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { Children, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import {
  Business as OrgIcon,
  Extension as SolutionIcon,
  Workspaces as WorkspaceIcon,
  PlayArrow as RunnerIcon,
  RotateRight as RunIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
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
  useTheme,
  CircularProgress,
} from '@mui/material';
import { useOrganizationsList } from 'src/state/organizations/hooks.js';
import { useRunnersList } from 'src/state/runners/hooks.js';
import { USERS_STATUS } from 'src/state/users/constants.js';
import { useUsersList, useUsersListStatus } from 'src/state/users/hooks.js';
import { useWorkspacesList } from 'src/state/workspaces/hooks.js';

const AVATAR_COLORS = ['#FF9F1C', '#2196F3', '#E67E22', '#27AE60', '#8E44AD', '#E74C3C'];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
};

const normalizeSearchValue = (value) => (value == null ? '' : String(value)).toLowerCase();

const matchesSearchQuery = (query, ...values) => {
  const normalizedQuery = normalizeSearchValue(query).trim();
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeSearchValue(value).includes(normalizedQuery));
};

const ResourceTreeItem = ({ icon, name, type, itemCount, depth = 0, children, theme }) => {
  const [expanded, setExpanded] = useState(type === 'ORGANIZATION');

  const hasChildren = Children.count(children) > 0;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          px: 2,
          pl: 2 + depth * 3,
          '&:hover': { bgcolor: theme.palette.action.hover },
          borderRadius: 1,
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <IconButton size="small" sx={{ mr: 0.5, p: 0.25, color: theme.palette.text.secondary }}>
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 28, mr: 0.5 }} />
        )}
        <Box sx={{ color: theme.palette.secondary.main, mr: 1.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary, lineHeight: 1.3 }}>
            {name}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
            {type}
            {itemCount != null && ` · ${itemCount} ITEMS`}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          sx={{
            ml: 1,
            minWidth: 70,
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              bgcolor: 'rgba(255, 159, 28, 0.08)',
            },
          }}
        >
          Assign
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
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
  }).isRequired,
};

export const AccessManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [resourceSearchScope, setResourceSearchScope] = useState('organizations');
  const [selectedUser, setSelectedUser] = useState(null);

  const users = useUsersList();
  const usersStatus = useUsersListStatus();
  const organizations = useOrganizationsList();
  const workspaces = useWorkspacesList();
  const runners = useRunnersList();

  // Demo users fallback when real users haven't loaded yet
  const displayUsers = useMemo(() => {
    if (users && users.length > 0) {
      return users.map((u, index) => ({
        id: u.id || u.username || u.email || `user-${index}`,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email || 'Unknown User',
        email: u.email || '',
        username: u.username || '',
      }));
    }
    return [
      { id: '1', name: 'Alice Martin', email: 'alice@cosmotech.com' },
      { id: '2', name: 'Bob Chen', email: 'bob@cosmotech.com' },
      { id: '3', name: 'Clara Dupont', email: 'clara@cosmotech.com' },
      { id: '4', name: 'David Kim', email: 'david@cosmotech.com' },
      { id: '5', name: 'Eva Schmidt', email: 'eva@cosmotech.com' },
    ];
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
          workspaces: orgWorkspaces,
        };
      });
    }
    return [
      {
        id: 'org1',
        name: 'Cosmo Tech Global',
        solutions: [
          { id: 's1', name: 'Supply Chain Optimizer' },
          { id: 's2', name: 'Energy Simulator' },
        ],
        workspaces: [
          {
            id: 'ws1',
            name: 'Production EU',
            itemCount: 22,
            runners: [
              { id: 'r1', name: 'Runner Alpha', type: 'RUNNER' },
              { id: 'r2', name: 'Run #1042', type: 'RUN' },
              { id: 'r3', name: 'Runner EU-001', type: 'RUNNER' },
              { id: 'r4', name: 'Runner EU-002', type: 'RUNNER' },
              { id: 'r5', name: 'Runner EU-003', type: 'RUNNER' },
              { id: 'r6', name: 'Runner EU-004', type: 'RUNNER' },
              { id: 'r7', name: 'Runner EU-005', type: 'RUNNER' },
            ],
          },
        ],
      },
    ];
  }, [organizations, workspaces, runners]);

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

  const assignedRolesCount = 0; // placeholder

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <LockIcon sx={{ color: theme.palette.secondary.main, fontSize: '1.3rem' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            {t('accessManagement.title')}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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
          sx={{
            minWidth: 260,
            flex: { xs: '1 1 100%', md: '0 1 320px' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.background.surface,
              borderRadius: 2,
              fontSize: '0.8125rem',
              '& fieldset': { borderColor: theme.palette.divider },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
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
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontSize: '0.8125rem',
                px: 1.5,
                py: 0.5,
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  bgcolor: theme.palette.background.surfaceVariant,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                },
              },
            }}
          >
            <ToggleButton value="organizations">{t('accessManagement.resourceScope.organizations')}</ToggleButton>
            <ToggleButton value="runners">{t('accessManagement.resourceScope.runners')}</ToggleButton>
            <ToggleButton value="workspaces">{t('accessManagement.resourceScope.workspaces')}</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            size="small"
            placeholder={t('accessManagement.searchResourcePlaceholder')}
            value={resourceSearchQuery}
            onChange={(e) => setResourceSearchQuery(e.target.value)}
            sx={{
              minWidth: 260,
              flex: { xs: '1 1 100%', md: '0 1 320px' },
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.background.surface,
                borderRadius: 2,
                fontSize: '0.8125rem',
                '& fieldset': { borderColor: theme.palette.divider },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
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
          display: 'flex',
          flex: 1,
          gap: 0,
          overflow: 'hidden',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Left Panel — Users List */}
        <Box
          sx={{
            width: 320,
            minWidth: 280,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              px: 2,
              pt: 2,
              pb: 1,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: theme.palette.text.secondary,
              fontSize: '0.7rem',
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
              return (
                <ListItem key={user.id} disablePadding>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.background.surfaceVariant,
                        borderLeft: `3px solid ${theme.palette.secondary.main}`,
                        '&:hover': {
                          bgcolor: theme.palette.background.surfaceVariant,
                        },
                      },
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: getAvatarColor(user.name),
                          fontSize: '0.8rem',
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
                            fontSize: '0.85rem',
                            fontWeight: isSelected ? 600 : 400,
                            color: theme.palette.text.primary,
                          },
                        },
                        secondary: {
                          sx: {
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Right Panel — Resource Tree */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme.palette.background.default,
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
                  gap: 2,
                  px: 3,
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: getAvatarColor(currentUser.name),
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  {getInitials(currentUser.name)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: '1.05rem', color: theme.palette.text.primary }}
                  >
                    {currentUser.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {currentUser.email}
                  </Typography>
                </Box>
                <Chip
                  label={`${assignedRolesCount} ${t('accessManagement.assignedRoles')}`}
                  size="small"
                  sx={{
                    bgcolor: theme.palette.background.surfaceVariant,
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>

              {/* Resource Tree */}
              <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
                {filteredOrgTree.length > 0 ? (
                  filteredOrgTree.map((org) => (
                    <ResourceTreeItem
                      key={org.id}
                      icon={<OrgIcon fontSize="small" />}
                      name={org.name}
                      type="ORGANIZATION"
                      itemCount={(org.solutions?.length || 0) + (org.workspaces?.length || 0)}
                      depth={0}
                      theme={theme}
                    >
                      {/* Solutions */}
                      {(org.solutions || []).map((sol) => (
                        <ResourceTreeItem
                          key={sol.id}
                          icon={<SolutionIcon fontSize="small" />}
                          name={sol.name}
                          type="SOLUTION"
                          depth={1}
                          theme={theme}
                        />
                      ))}
                      {/* Workspaces */}
                      {(org.workspaces || []).map((ws) => (
                        <ResourceTreeItem
                          key={ws.id}
                          icon={<WorkspaceIcon fontSize="small" />}
                          name={ws.name}
                          type="WORKSPACE"
                          itemCount={ws.runners?.length || ws.itemCount}
                          depth={1}
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
                              theme={theme}
                            />
                          ))}
                        </ResourceTreeItem>
                      ))}
                    </ResourceTreeItem>
                  ))
                ) : (
                  <Box sx={{ px: 3, py: 2 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {t('accessManagement.noResourcesMatch')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {t('accessManagement.selectUser')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
