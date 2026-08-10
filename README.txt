SAO WORKPLACE V5.1 — FINAL CLOUD SYNC

Firebase project:
SAO-WORKPLACE-CLOUD
Plan: Spark / no-cost

WHAT THIS VERSION DOES
- Email/password Firebase Authentication
- Automatic laptop <-> mobile structured-data synchronization
- Real-time Firestore listener
- First laptop login migrates existing local planner data to cloud when cloud is empty
- Mobile login downloads the same cloud workspace
- Local browser copy remains available
- Firestore web offline persistence requested
- Visible status:
  Cloud sign-in required
  Connecting cloud...
  Syncing...
  Synced
  Offline
  Sync error
- Forgot password email
- Manual Sync Now
- Sign Out

SYNCED DATA
- Tasks & Projects
- My Day / Status Board data (derived from tasks)
- Study Planner
- Wellness & Sadhana
- Travel & Seminar
- Review reflections
- App settings

DEVICE-LOCAL ONLY
- Files / PDFs / image blobs stored in IndexedDB remain local to that device.
  Cloud Storage is intentionally NOT enabled on Spark in this version.

FIRST TEST
1. Deploy ALL files to GitHub Pages.
2. Open laptop app.
3. Sign in using the Firebase user you created.
4. Existing laptop data should upload if cloud is empty.
5. Wait for "Synced".
6. Open the same URL/app on mobile.
7. Sign in with the SAME email/password.
8. Laptop data should appear.
9. Add a simple test task on mobile and confirm it appears on laptop.

SECURITY
Firestore rules must remain:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
