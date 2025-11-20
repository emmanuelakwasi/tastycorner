# How to Push to GitHub

Since I cannot access your GitHub account directly, you need to create the repository and push the code.

### Step 1: Create a New Repository
1.  Go to [github.com/new](https://github.com/new).
2.  Repository name: `tastycorner` (or whatever you prefer).
3.  **Important**: Do **NOT** check "Initialize with README", "Add .gitignore", or "Add license". We already have these.
4.  Click **Create repository**.

### Step 2: Push the Code
Copy the URL of your new repository (e.g., `https://github.com/emmanuelakwasi/tastycorner.git`).

Run the following commands in your terminal:

```bash
# Link your local repo to GitHub
git remote add origin https://github.com/emmanuelakwasi/YOUR_REPO_NAME.git

# Rename branch to main (if not already)
git branch -M main

# Push your code
git push -u origin main
```

### Step 3: Verify
Refresh your GitHub repository page. You should see all your files there!
