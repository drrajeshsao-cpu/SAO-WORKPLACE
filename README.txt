SAO WORKPLACE V5.2 — CLOUD CONNECTION HOTFIX

Why this hotfix exists:
Some mobile/PWA sessions could remain on "Connecting cloud..." while waiting for
the first Firestore read. V5.2 starts the realtime listener immediately and adds
a 12-second server connectivity test instead of waiting indefinitely.

Safety improvement:
- A failed cloud read NEVER triggers an automatic empty-device upload.
- Empty mobile data will not overwrite existing cloud data.
- Existing meaningful laptop data can seed an empty cloud.
- Realtime listener stays active and can recover automatically.
- Account menu includes "Test Cloud".
- Clear Cloud connection problem / Permission denied / Sign-in required states.

Expected mobile result:
Connecting cloud... -> Synced
or, within ~12 seconds, a clear Cloud connection problem message.

If it shows Cloud connection problem:
1. Open Account -> Test Cloud.
2. Check internet.
3. Confirm Firestore Rules and Firebase Authentication.
4. Do not use Sync Now until Test Cloud succeeds.
