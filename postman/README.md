# ESS Client Backend API - Postman Assets

These assets provide an industrial-grade, future-proof Postman setup for local development and production use.

## Files
- `ESS_Client_Backend_API.postman_collection.json` — Full API collection grouped by module.
- `ESS_API_Local.postman_environment.json` — Local environment (http://localhost:3001).
- `ESS_API_Production_Template.postman_environment.json` — Production template; set your actual base URL and cookie values.

## Import Instructions
1. Open Postman → Import → Files.
2. Select the collection JSON and your desired environment JSON.
3. Choose the imported environment in the top-right environment selector.

## Variables & Cookies
- Variables: `baseUrl`, `EmpID`, `CompanyID`, `reqid`, `tripid`.
- The collection has a Pre-request Script which sets cookies for each request host:
  - `EmpID` = `{{EmpID}}`
  - `CompanyID` = `{{CompanyID}}`
- `Context` cookie is also set as JSON with `CompanyID` so the backend can read `req.cookies.Context.CompanyID`.
- The server normalizes cookies via `src/middlewares/normalizeCookies.js` (supports `Context.CompanyID`, `context.CompanyID`, and flat `CompanyID`).

## Switching Environments
- Local: use `ESS API - Local` (baseUrl `http://localhost:3001`).
- Production: duplicate `ESS API - Production (Template)` and update `baseUrl`, `EmpID`, `CompanyID`.

## File Uploads
- Reimbursement: form-data key `receipt` (type: File).
- BusinessTrip: form-data key `attachment` (type: File).
- Leave: form-data key `attachment` (type: File).
- Excuse: form-data key `attachment` (type: File).
- Profile Photo: form-data key `photo` (type: File).

Accepted types: JPEG, PNG, PDF (see `src/middlewares/upload.js`). Max size: 30MB.

## Dynamic IDs
- Some endpoints use headers like `reqid` (lowercase) or `tripid`.
- Tests auto-capture common IDs from responses (e.g., `DocumentReqID`/`documentReqID`, `LeaveReqID`, `ExcuseReqID`, `ReqID`, `tripId`) and set both `reqid` and `tripid` environment vars for chaining.

## Known Route Oddities (mirrored for testing)
- `notification.routes.js`: uses `broadcaseNotification` instead of `broadcastNotification`.
- `team.routes.js`: path `getTeamHeirarchy` (typo).
- The collection keeps these as-is so you can test current behavior; consider fixing these in code before production.

## Example Flow
1. Set `EmpID` and `CompanyID` in your environment.
2. Reimbursement → Get Reimbursement Transactions (GET).
3. Reimbursement → Submit Reimbursement Request (POST with `receipt`).
4. Reimbursement → Get Pending Reimbursement Requests (GET).
5. Reimbursement → Approve/Reject Reimbursement Request (PATCH).

## CLI (Newman) Example
You can run the collection from CI/CD with Newman:

```bash
newman run postman/ESS_Client_Backend_API.postman_collection.json \
  -e postman/ESS_API_Local.postman_environment.json \
  --env-var EmpID=E001 --env-var CompanyID=C001
```

> Tip: For production pipelines, use a secure secret store for `EmpID`/`CompanyID` values if required.

## Notes
- This setup assumes cookie-based context (EmpID, CompanyID). If you later add token-based auth, extend the collection with Auth headers and secure variables.
- Base URL is variable-driven for portability across environments.
