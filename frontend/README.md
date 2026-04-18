# CommunityConn Frontend (Testing Branch)

This is a lightweight frontend UI to test the current backend flows:

- Signup/Login
- Issue listing
- Admin issue creation
- Admin volunteer matching + assignment
- Volunteer profile update

## Run locally

From the repository root:

```bash
cd frontend
python3 -m http.server 5173
```

Then open: `http://localhost:5173`

> By default, the UI uses `http://localhost:5000/api` as API base URL. You can change it from the left sidebar.
