// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useCreateKeycloakUser } from 'src/state/users/hooks.js';

/**
 * Generate a random 12-character password with uppercase, lowercase, digits, and special chars.
 */
const generatePassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*?';
  const all = upper + lower + digits + special;

  const array = new Uint32Array(12);
  crypto.getRandomValues(array);

  // Guarantee at least one character from each category
  let password = '';
  password += upper[array[0] % upper.length];
  password += lower[array[1] % lower.length];
  password += digits[array[2] % digits.length];
  password += special[array[3] % special.length];

  for (let i = 4; i < 12; i++) {
    password += all[array[i] % all.length];
  }

  // Shuffle the password
  const shuffled = password.split('');
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.join('');
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getCreateUserErrorMessage = (err, t) => {
  if (err?.code === 'ADMIN_ROLE_ASSIGNMENT_FAILED') {
    return t(
      'users.addDialog.adminAssignmentFailed',
      'Platform Admin assignment failed. The new user was rolled back automatically. Please verify Keycloak role configuration and retry.'
    );
  }

  if (err?.code === 'ADMIN_ROLE_ASSIGNMENT_ROLLBACK_FAILED') {
    const email = err?.email || '';
    const userId = err?.userId ? ` (ID: ${err.userId})` : '';
    return t('users.addDialog.adminAssignmentRollbackFailed', {
      email,
      userId,
      defaultValue:
        'Platform Admin assignment failed and automatic rollback also failed. ' +
        'Please delete the user manually in Keycloak: {{email}}{{userId}}.',
    });
  }

  return err?.response?.data?.errorMessage || err?.message || t('users.addDialog.error');
};

export const AddUserDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const createUser = useCreateKeycloakUser();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFullName('');
      setEmail('');
      setPassword(generatePassword());
      setRole('user');
      setShowPassword(false);
      setIsSubmitting(false);
      setError(null);
      setFieldErrors({});
    }
  }, [open]);

  const validate = useCallback(() => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = true;
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) errors.email = true;
    if (!password.trim()) errors.password = true;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fullName, email, password]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createUser({ fullName: fullName.trim(), email: email.trim(), password, role });
      onClose();
    } catch (err) {
      setError(getCreateUserErrorMessage(err, t));
    } finally {
      setIsSubmitting(false);
    }
  }, [createUser, email, fullName, onClose, password, role, t, validate]);

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pb: 0.5,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            {t('users.addDialog.title')}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
            {t('users.addDialog.subtitle')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting} sx={{ color: theme.palette.text.secondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          {t('users.addDialog.fullName')}
        </Typography>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={t('users.addDialog.fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: false }));
          }}
          error={fieldErrors.fullName}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          {t('users.addDialog.email')}
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder={t('users.addDialog.emailPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: false }));
          }}
          error={fieldErrors.email}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          {t('users.addDialog.platformRole')}
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <Select value={role} onChange={(e) => setRole(e.target.value)} disabled={isSubmitting}>
            <MenuItem value="user">{t('users.addDialog.roleUser')}</MenuItem>
            <MenuItem value="admin">{t('users.addDialog.roleAdmin')}</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
          {t('users.addDialog.tempPassword')}
        </Typography>
        <TextField
          fullWidth
          size="small"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: false }));
          }}
          error={fieldErrors.password}
          disabled={isSubmitting}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setPassword(generatePassword())}
                    edge="end"
                    disabled={isSubmitting}
                    sx={{ color: theme.palette.text.secondary, ml: 0.5 }}
                    title={t('users.addDialog.regenerate')}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
        <Button onClick={onClose} disabled={isSubmitting} sx={{ color: theme.palette.text.primary }}>
          {t('users.addDialog.cancel')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              {t('users.addDialog.creating')}
            </Box>
          ) : (
            t('users.addDialog.create')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
