# Deployment Guide (Render.com)

This project is configured for easy deployment on **Render**, which offers a free tier for web services.

### Prerequisites
*   You have pushed your code to GitHub (see `GITHUB_INSTRUCTIONS.md`).
*   You have a [Render.com](https://render.com) account.

### Step 1: Create New Web Service
1.  Log in to Render Dashboard.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub account and select your `tastycorner` repository.

### Step 2: Configure Service
Render will auto-detect most settings, but verify these:

*   **Name**: `tastycorner-app` (or similar)
*   **Region**: Closest to you
*   **Branch**: `main`
*   **Runtime**: `Python 3`
*   **Build Command**: `pip install -r requirements.txt`
*   **Start Command**: `gunicorn run:app` (This is crucial!)

### Step 3: Environment Variables
Scroll down to **Environment Variables** and add the following:

| Key | Value |
| --- | --- |
| `PYTHON_VERSION` | `3.10.0` (or similar) |
| `SECRET_KEY` | (Generate a strong random string) |
| `ADMIN_EMAIL` | `your-email@example.com` |
| `ADMIN_PASSWORD` | `your-secure-password` |

### Step 4: Deploy
1.  Click **Create Web Service**.
2.  Render will start building your app. This takes a few minutes.
3.  Once you see "Live", click the URL (e.g., `https://tastycorner-app.onrender.com`) to view your site!

### Troubleshooting
*   **Database**: The SQLite database will be created automatically, BUT **data will be lost** every time you redeploy on the free tier (because the filesystem is ephemeral).
*   **Persistent Data**: For production, you should use a **PostgreSQL** database. Render offers a managed PostgreSQL database.
    *   To switch, you would need to update `config.py` to read `DATABASE_URL` and install `psycopg2-binary`.
