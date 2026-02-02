// SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
// SPDX-License-Identifier: LicenseRef-CosmoTech
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Container, Paper, Typography } from '@mui/material';
import { apiManager } from 'src/services/api/apiManager';
import { useLogin } from 'src/state/auth/hooks.js';

export const Login = () => {
  const { t } = useTranslation();
  const login = useLogin();
  const [selectedApi, setSelectedApi] = useState('');
  const apis = apiManager.getApis();

  const handleApiChange = (event) => {
    setSelectedApi(event.target.value);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (selectedApi) {
      apiManager.selectApi(selectedApi, apis?.[selectedApi]);
      login(selectedApi);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {t('login.title')}
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="api-select-label">{t('login.selectApi')}</InputLabel>
            <Select
              labelId="api-select-label"
              id="api-select"
              value={selectedApi}
              label="Select API"
              onChange={handleApiChange}
            >
              {Object.keys(apis).map((apiName) => (
                <MenuItem key={apiName} value={apiName} sx={{ py: 1, minHeight: '48px', typography: 'body1' }}>
                  {apiName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 3 }}>
            <Button fullWidth variant="contained" onClick={(event) => handleLogin(event)} disabled={!selectedApi}>
              {t('login.loginButton')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
