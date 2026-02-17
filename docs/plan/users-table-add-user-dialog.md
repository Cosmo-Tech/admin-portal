# Users Table & Add User Dialog Redesign Plan

## Summary

- Remove "Organizations" and "Last Login" columns from the UsersTable
- Add colored avatar initials to the Name column (as in provided screenshot)
- Implement a real "Add New User" dialog with Full Name, Email Address, and an auto-generated editable temporary password
- Dialog calls Keycloak Admin API POST /admin/realms/{realm}/users with temporary: true credentials
- Both light and dark themes are handled via MUI's useTheme
- New Redux thunk handles the creation call

---

## Steps

1. **Remove columns from table**
   - In UsersTable.jsx, remove the "Organizations" and "Last Login" <TableCell> entries from:
     - The <TableHead> row
     - The <TableBody> row mapping
     - The mapKeycloakUserToRow function — remove organizations and lastLogin fields
     - The empty-row colSpan — reduce from 8/7 to 6/5

2. **Remove filter columns**
   - In UsersTableFilters.jsx, remove the Organizations filter <TableCell> (the filters.org field) and the empty <TableCell> that was for Last Login
   - Also remove org from the filters state in UsersTable.jsx and the corresponding filter logic in the rows useMemo

3. **Add avatar initials to Name column**
   - In UsersTable.jsx, add an MUI <Avatar> component next to the user name in each row
   - Extract initials from the name (first letter of first name + first letter of last name)
   - Use a deterministic color based on the user name (hash to pick from a palette of ~8 colors)
   - Wrap in a <Box display="flex" alignItems="center" gap={1}>
   - The avatar should be small (~32px), with white text on a colored background

4. **Create AddUserDialog component**
   - New file src/components/UsersTable/AddUserDialog.jsx
   - MUI <Dialog> with maxWidth="sm" and fullWidth
   - Title: "Add New User" / subtitle: "Enter the user's details to create an account."
   - Fields: Full Name (TextField), Email Address (TextField), Temporary Password (TextField with type toggle visibility, auto-generated on open)
   - Auto-generate password: 12-char random string (uppercase, lowercase, digits, special chars) using crypto.getRandomValues
   - Buttons: "Cancel" (text/outlined) and "Create User" (contained, secondary color = orange)
   - Validation: all three fields required, basic email format check
   - On submit: dispatch createKeycloakUser thunk → on success close dialog & refresh user list → on error show inline error alert
   - Theme-aware: use theme.palette.background.paper for dialog background, theme.palette.text.primary/secondary for text, theme.palette.divider for borders — works for both light/dark automatically

5. **Create createKeycloakUser thunk**
   - New file src/state/users/thunks/createKeycloakUser.js
   - Import getAxiosInstance, deriveKeycloakAdminUrl from apiClient.js and apiManager
   - Split "Full Name" into firstName / lastName (split on first space)
   - POST {adminUrl}/users with body:
     {
       "firstName": "...",
       "lastName": "...",
       "email": "...",
       "enabled": true,
       "emailVerified": false,
       "credentials": [{ "type": "password", "value": "...", "temporary": true }]
     }
   - Keycloak returns 201 Created with a Location header on success
   - On success: re-dispatch fetchRealmUsers() to refresh the table
   - On error: throw with the Keycloak error message (e.g. "User exists with same email")
   - Export a custom hook useCreateKeycloakUser from hooks.js

6. **Wire dialog into UsersTable**
   - In UsersTable.jsx:
     - Add const [addDialogOpen, setAddDialogOpen] = useState(false)
     - Replace the onClick stub on the "Add New User" button with () => setAddDialogOpen(true)
     - Render <AddUserDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} />

7. **Add i18n keys**
   - Add new translation keys to both en/common.json and fr/common.json:
     - users.addDialog.title → "Add New User" / "Ajouter un utilisateur"
     - users.addDialog.subtitle → "Enter the user's details to create an account." / "Entrez les détails de l'utilisateur pour créer un compte."
     - users.addDialog.fullName → "Full Name" / "Nom complet"
     - users.addDialog.email → "Email Address" / "Adresse e-mail"
     - users.addDialog.tempPassword → "Temporary Password" / "Mot de passe temporaire"
     - users.addDialog.cancel → "Cancel" / "Annuler"
     - users.addDialog.create → "Create User" / "Créer l'utilisateur"
     - users.addDialog.creating → "Creating..." / "Création..."
     - users.addDialog.error → "Failed to create user" / "Échec de la création de l'utilisateur"
     - users.addDialog.success → "User created successfully" / "Utilisateur créé avec succès"
     - users.addDialog.fullNamePlaceholder → "John Doe"
     - users.addDialog.emailPlaceholder → "john@example.com"

8. **Export AddUserDialog**
   - Add to UsersTable/index.js

## Verification
- Start dev server with yarn start, navigate to Users page
- Verify table shows only: Checkbox, Name (with avatar), Email, Platform Role, Status, Actions
- Click "Add New User" → dialog opens with pre-filled random password
- Fill name + email → click "Create User" → verify user appears in Keycloak admin console and table refreshes
- Test with invalid email → verify inline validation
- Test with duplicate email → verify Keycloak error displayed
- Toggle dark mode → verify dialog and table render correctly in both themes
- Test French locale → verify all dialog labels translated

## Decisions
- Remove Organizations and Last Login columns (user-confirmed)
- Temporary password: auto-generated, editable, 12 chars (user-confirmed)
- Keycloak temporary: true — user must change password on first login (user-confirmed)
- Submit button labeled "Create User" instead of "Send Invite" (user-confirmed)
- Avatar colors: deterministic hash from user name, no new palette tokens needed (simple utility)
- Keycloak user creation uses the same getAxiosInstance() pattern as existing thunks (consistent with fetchRealmUsers)
