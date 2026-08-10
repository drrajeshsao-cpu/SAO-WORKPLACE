SAO WORKPLACE V5.3 — FIRST DEVICE CLOUD MIGRATION FIX

ROOT CAUSE FIXED
V5.2 correctly connected to Firebase, but the laptop showed:
"Cloud ready • no data yet"
while 17 local tasks were visible.

Reason:
app.js declared `const app = ...`, which is not automatically exposed as `window.app`.
The ES-module cloud-sync.js therefore could not read the local SAO Workplace data bridge.

V5.3 explicitly exposes:
window.app = app

RESULT
- Existing laptop local tasks/study/wellness/travel can now be detected.
- If Firestore cloud is empty, laptop automatically uploads existing local structured data.
- Mobile using the same account downloads the same workspace.
- Realtime changes synchronize between devices.
- Empty mobile data is still prevented from overwriting meaningful cloud data.

TEST
1. Deploy all root files.
2. Laptop: hard refresh / close & reopen installed PWA.
3. Wait for:
   Uploading this device data...
   then
   Synced
4. Open Account -> Test Cloud if needed.
5. Mobile: close & reopen app, sign in with same account.
6. Confirm the laptop's existing 17 tasks appear.
7. Create one test task on mobile and confirm it appears on laptop.
