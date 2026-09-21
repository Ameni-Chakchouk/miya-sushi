# Local launch

## What was wrong

The project itself is healthy, but the local runtime was incomplete:

- MySQL is running
- Vite is running on `127.0.0.1:5173`
- Laravel was not actually listening on `127.0.0.1:8000`

That means the frontend dev server can be alive while the real app URL still fails.

## Fastest way to open the app

1. Start MySQL in XAMPP.
2. Double-click `start-built.bat`.
3. Wait for the Laravel terminal window to stay open.
4. Open `http://127.0.0.1:8000`.

## Dev mode

1. Start MySQL in XAMPP.
2. Double-click `start-dev.bat`.
3. Keep both terminal windows open:
   - Laravel
   - Vite
4. Open `http://127.0.0.1:8000`.

## Manual commands

Production-like local mode:

```powershell
cd "C:\Users\User\Documents\Codex\2026-04-18-est-ce-que-vous-pouvez-coder"
if (Test-Path public\hot) { Remove-Item public\hot -Force }
npm run build
C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

Dev mode:

Terminal 1:

```powershell
cd "C:\Users\User\Documents\Codex\2026-04-18-est-ce-que-vous-pouvez-coder"
C:\xampp\php\php.exe artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2:

```powershell
cd "C:\Users\User\Documents\Codex\2026-04-18-est-ce-que-vous-pouvez-coder"
npm run dev
```

## If it still fails

- Check that MySQL is started in XAMPP.
- Check that the Laravel terminal window is still open.
- Check that `http://127.0.0.1:8000` opens, not only `5173`.
- If you want the built version, stop Vite and delete `public\hot`.
