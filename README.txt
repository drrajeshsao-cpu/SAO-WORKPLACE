SAO WORKPLACE V2.1 — WORKING FIX

Fixed root cause of blank dashboard and dead buttons:
- V2 app.js exported an undefined function named reschedule. That stopped the whole JavaScript app from initializing.
- My Day, Status Board and Review Center templates existed, but their render functions were missing from the view router.

V2.1 fixes:
- All navigation buttons wired.
- Dashboard renders.
- Quick Add works.
- My Day works.
- Tasks & Projects works.
- Status Board / Kanban works.
- Study, Wellness, Travel, Review, Summary, Files, Backup, Settings all routed.
- Reschedule Tomorrow / Next Week added.
- Task smart fields: estimated minutes, progress, repeat, focus, next action, waiting for/contact.
- Service worker cache replaced with v2.1 and immediate activation.
- View errors display a visible message rather than a blank page.

Deploy ALL root files and hard refresh / close-reopen installed app.
