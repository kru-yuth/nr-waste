---
description: How to deploy to a specific Firebase Hosting site (Multi-site setup)
---

# Deploy to a Separate Site (Multi-site)

Since you want to keep the main site (NR Nexus) separate, follow these steps.

## 1. Create a New Site in Firebase Console
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (**NR Nexus**).
3.  Go to **Build** -> **Hosting** in the left menu.
4.  Scroll down to the bottom to the **"Advanced"** section (or look for "Add another site").
5.  Click **Add another site**.
6.  Enter a site name (e.g., `nr-waste-stats`). *Remember this name.*

## 2. Configure Local Project
Run these commands in your terminal (replace `YOUR_SITE_NAME` with the name you just created):

```powershell
# 1. Login if needed
firebase login

# 2. Apply a "target" name to your site
# This tells Firebase that "waste-app" refers to your specific site name
firebase target:apply hosting waste-app YOUR_SITE_NAME
```

## 3. Update Configuration
I will update `firebase.json` for you, or you can ensure it looks like this:
```json
{
  "hosting": {
    "target": "waste-app",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 4. Build and Deploy
```powershell
// turbo-all
npm run build
firebase deploy --only hosting:waste-app
```
