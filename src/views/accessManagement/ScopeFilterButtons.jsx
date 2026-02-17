// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import PropTypes from 'prop-types';
import {
  ApartmentOutlined as OrgIcon,
  DeveloperBoardOutlined as SolutionIcon,
  FolderOpenOutlined as WorkspaceIcon,
  PlayArrowOutlined as RunnerIcon,
} from '@mui/icons-material';
import { Box, ToggleButton, Typography } from '@mui/material';

const ScopeToggleLabel = ({ icon, label }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.62 }}>
    {icon}
    <Typography component="span" variant="body2" sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 1 }}>
      {label}
    </Typography>
  </Box>
);

ScopeToggleLabel.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
};

const RESOURCE_SCOPE_BUTTONS = [
  { value: 'organizations', icon: <OrgIcon sx={{ fontSize: '0.9rem' }} />, key: 'organizations' },
  { value: 'solutions', icon: <SolutionIcon sx={{ fontSize: '0.9rem' }} />, key: 'solutions' },
  { value: 'workspaces', icon: <WorkspaceIcon sx={{ fontSize: '0.9rem' }} />, key: 'workspaces' },
  { value: 'runners', icon: <RunnerIcon sx={{ fontSize: '0.9rem' }} />, key: 'runners' },
];

export const ScopeFilterButtons = ({ value, onChange, t, theme }) => {
  const amColors = theme.palette.accessManagement || {};
  const fontFamily = amColors.fontFamily || theme.typography.fontFamily;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
      {RESOURCE_SCOPE_BUTTONS.map((scope) => {
        const isSelected = value === scope.value;
        return (
          <ToggleButton
            key={scope.value}
            value={scope.value}
            selected={isSelected}
            onChange={() => onChange(scope.value)}
            disableRipple
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              border: `1px solid ${
                isSelected
                  ? amColors.scopeButtonSelectedBorder || theme.palette.secondary.main
                  : amColors.scopeButtonBorder || theme.palette.divider
              }`,
              bgcolor: isSelected
                ? amColors.scopeButtonSelectedBg || theme.palette.action.selected
                : amColors.scopeButtonBg || theme.palette.background.surface,
              color: isSelected
                ? amColors.scopeButtonSelectedText || theme.palette.secondary.main
                : amColors.scopeButtonText || theme.palette.text.secondary,
              px: 1.28,
              py: 0.55,
              minHeight: 34,
              minWidth: 'fit-content',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              fontSize: '0.83rem',
              fontWeight: isSelected ? 600 : 500,
              fontFamily,
              '&:hover': {
                borderColor: isSelected
                  ? amColors.scopeButtonSelectedBorder || theme.palette.secondary.main
                  : amColors.scopeButtonHoverBorder || theme.palette.divider,
                bgcolor: isSelected
                  ? amColors.scopeButtonSelectedHoverBg || amColors.scopeButtonSelectedBg || theme.palette.action.hover
                  : amColors.scopeButtonHoverBg || theme.palette.action.hover,
              },
              '&.Mui-selected': {
                borderColor: amColors.scopeButtonSelectedBorder || theme.palette.secondary.main,
                bgcolor: amColors.scopeButtonSelectedBg || theme.palette.action.selected,
                color: amColors.scopeButtonSelectedText || theme.palette.secondary.main,
                '&:hover': {
                  bgcolor:
                    amColors.scopeButtonSelectedHoverBg ||
                    amColors.scopeButtonSelectedBg ||
                    theme.palette.action.selected,
                },
              },
            }}
          >
            <ScopeToggleLabel icon={scope.icon} label={t(`accessManagement.resourceScope.${scope.key}`)} />
          </ToggleButton>
        );
      })}
    </Box>
  );
};

ScopeFilterButtons.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
    typography: PropTypes.object.isRequired,
  }).isRequired,
};
