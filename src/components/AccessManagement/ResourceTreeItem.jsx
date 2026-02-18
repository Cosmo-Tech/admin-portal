// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import { Children, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ExpandMoreRounded as ExpandMoreIcon,
  ChevronRightRounded as ChevronRightIcon,
  CheckRounded as CheckIcon,
  KeyboardArrowDownRounded as ArrowDownIcon,
} from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const RESOURCE_ROW_DENSITY = {
  ORGANIZATION: {
    minHeight: 58,
    verticalPadding: 1.1,
    nameFontSize: '1rem',
    metaFontSize: '0.68rem',
    metaLetterSpacing: 0.8,
    iconSize: '1.1rem',
    buttonMinWidth: 78,
    buttonHeight: 30,
    buttonFontSize: '0.8rem',
    buttonHorizontalPadding: 1.25,
    marginBottom: 0.82,
  },
  SOLUTION: {
    minHeight: 48,
    verticalPadding: 0.75,
    nameFontSize: '0.93rem',
    metaFontSize: '0.63rem',
    metaLetterSpacing: 0.7,
    iconSize: '0.98rem',
    buttonMinWidth: 70,
    buttonHeight: 27,
    buttonFontSize: '0.75rem',
    buttonHorizontalPadding: 1.05,
    marginBottom: 0.5,
  },
  WORKSPACE: {
    minHeight: 48,
    verticalPadding: 0.75,
    nameFontSize: '0.93rem',
    metaFontSize: '0.63rem',
    metaLetterSpacing: 0.7,
    iconSize: '0.98rem',
    buttonMinWidth: 70,
    buttonHeight: 27,
    buttonFontSize: '0.75rem',
    buttonHorizontalPadding: 1.05,
    marginBottom: 0.45,
  },
  RUNNER: {
    minHeight: 44,
    verticalPadding: 0.55,
    nameFontSize: '0.93rem',
    metaFontSize: '0.63rem',
    metaLetterSpacing: 0.64,
    iconSize: '0.9rem',
    buttonMinWidth: 62,
    buttonHeight: 24,
    buttonFontSize: '0.71rem',
    buttonHorizontalPadding: 0.9,
    marginBottom: 0.35,
  },
};

export const ResourceTreeItem = ({
  icon,
  name,
  type,
  itemCount,
  depth = 0,
  children,
  theme,
  assignLabel,
  roleLabel,
  isDraft,
  isAutoDraft,
  isDirectDraft,
  canAssign,
  isSaving,
  onAssignClick,
  resourceKey,
}) => {
  const [expanded, setExpanded] = useState(type === 'ORGANIZATION' || type === 'WORKSPACE');
  const amColors = theme.palette.accessManagement || {};
  const treeIconColors = amColors.treeIconColors || {};

  const hasChildren = Children.count(children) > 0;
  const connectorLeft = 24 + (depth - 1) * 36;
  const itemType = type || 'RUNNER';
  const rowDensity = RESOURCE_ROW_DENSITY[itemType] || RESOURCE_ROW_DENSITY.RUNNER;
  const iconColor = treeIconColors[itemType] || amColors.resourceItemSubtext || theme.palette.text.secondary;

  const isRoleAssigned = Boolean(roleLabel);
  const buttonDisabled = !canAssign || isSaving || !resourceKey;

  const rowBorderColor = isAutoDraft
    ? amColors.draftAutoBorder || theme.palette.secondary.main
    : isDirectDraft
      ? amColors.draftDirectBorder || theme.palette.success.main
      : amColors.resourceItemBorder || theme.palette.divider;

  const rowBackgroundColor = isAutoDraft
    ? amColors.draftAutoBg || alpha(theme.palette.secondary.main, 0.08)
    : isDirectDraft
      ? amColors.draftDirectBg || alpha(theme.palette.success.main, 0.1)
      : amColors.resourceItemBg || theme.palette.background.surface;

  const onAssignButtonClick = (event) => {
    event.stopPropagation();
    if (buttonDisabled) return;
    onAssignClick(event, resourceKey);
  };

  return (
    <Box sx={{ position: 'relative', mb: rowDensity.marginBottom }}>
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
          minHeight: rowDensity.minHeight,
          py: rowDensity.verticalPadding,
          px: 1.5,
          pl: 1.5 + depth * 4.5,
          borderRadius: 1.5,
          border: `1px ${isAutoDraft ? 'dashed' : 'solid'} ${rowBorderColor}`,
          bgcolor: rowBackgroundColor,
          transition: 'border-color 0.2s ease, background-color 0.2s ease',
          cursor: hasChildren ? 'pointer' : 'default',
          '&:hover': {
            bgcolor: isDraft ? rowBackgroundColor : amColors.resourceItemHoverBg || theme.palette.action.hover,
            borderColor: isDraft ? rowBorderColor : alpha(theme.palette.secondary.main, 0.6),
          },
        }}
        onClick={() => hasChildren && setExpanded((value) => !value)}
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
            '& svg': { fontSize: rowDensity.iconSize },
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
              fontSize: rowDensity.nameFontSize,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: amColors.fontFamily || theme.typography.fontFamily,
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: amColors.resourceItemSubtext || theme.palette.text.secondary,
              fontSize: rowDensity.metaFontSize,
              letterSpacing: rowDensity.metaLetterSpacing,
              textTransform: 'uppercase',
              fontFamily: amColors.fontFamily || theme.typography.fontFamily,
            }}
          >
            {itemType}
            {itemCount != null && ` · ${itemCount} items`}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, pl: 0.4 }}>
          <Button
            variant={isRoleAssigned ? 'contained' : 'outlined'}
            size="small"
            disableElevation
            onClick={onAssignButtonClick}
            disabled={buttonDisabled}
            sx={{
              minWidth: rowDensity.buttonMinWidth,
              height: rowDensity.buttonHeight,
              px: rowDensity.buttonHorizontalPadding,
              borderRadius: 2,
              fontSize: rowDensity.buttonFontSize,
              fontWeight: 500,
              fontFamily: amColors.fontFamily || theme.typography.fontFamily,
              textTransform: 'none',
              borderColor: isRoleAssigned
                ? amColors.roleButtonBorder || theme.palette.primary.main
                : amColors.assignButtonBorder || theme.palette.divider,
              borderStyle: isRoleAssigned ? 'solid' : 'dashed',
              color: isRoleAssigned
                ? amColors.roleButtonText || theme.palette.text.primary
                : amColors.assignButtonText || theme.palette.text.secondary,
              bgcolor: isRoleAssigned ? amColors.roleButtonBg || theme.palette.background.paper : 'transparent',
              '&:hover': {
                borderColor: isRoleAssigned
                  ? amColors.roleButtonHoverBorder || theme.palette.primary.main
                  : theme.palette.secondary.main,
                color: isRoleAssigned
                  ? amColors.roleButtonText || theme.palette.text.primary
                  : amColors.assignButtonHoverText || theme.palette.secondary.main,
                bgcolor: isRoleAssigned
                  ? amColors.roleButtonHoverBg || alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.secondary.main, 0.08),
              },
              '&.Mui-disabled': {
                borderColor:
                  amColors.assignButtonDisabledBorder || amColors.assignButtonBorder || theme.palette.divider,
                color: amColors.assignButtonDisabledText || amColors.assignButtonText || theme.palette.text.disabled,
                bgcolor: amColors.assignButtonDisabledBg || 'transparent',
              },
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
              {isRoleAssigned ? roleLabel : assignLabel}
              {resourceKey && <ArrowDownIcon sx={{ fontSize: '0.95rem' }} />}
            </Box>
          </Button>

          {isAutoDraft && (
            <CheckIcon sx={{ fontSize: '1rem', color: amColors.autoDraftCheck || theme.palette.success.main }} />
          )}
        </Box>
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
  roleLabel: PropTypes.string,
  isDraft: PropTypes.bool,
  isAutoDraft: PropTypes.bool,
  isDirectDraft: PropTypes.bool,
  canAssign: PropTypes.bool,
  isSaving: PropTypes.bool,
  onAssignClick: PropTypes.func.isRequired,
  resourceKey: PropTypes.string,
  theme: PropTypes.shape({
    palette: PropTypes.object.isRequired,
    typography: PropTypes.object.isRequired,
  }).isRequired,
};
