{{/*
SPDX-FileCopyrightText: Copyright (C) 2024-2025 Cosmo Tech
SPDX-License-Identifier: LicenseRef-CosmoTech
*/}}

{{/* Generates the name of the webapp server */}}
{{- define "cosmotech-admin-portal.server-name" -}}
{{ .Values.name }}-server
{{- end }}
