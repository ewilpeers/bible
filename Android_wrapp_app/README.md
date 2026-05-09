# Bibele Viewer

Minimal Android WebView app that lists and opens files from `/sdcard/bible/bibele_andr`.

## Features

- File browser at `/sdcard/bible/bibele_andr` with subdirectory navigation
- Taps on files load them into a WebView (HTML, images, PDFs via plugin, text)
- Back button returns to the file list / parent directory
- Pinch-zoom enabled
- Handles MANAGE_EXTERNAL_STORAGE permission flow on Android 11+

## Build

Open in Android Studio, or from CLI:

```bash
./gradlew assembleDebug
```

APK output: `app/build/outputs/apk/debug/app-debug.apk`

Install:
```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Permissions

On first launch the app prompts for "All files access" (Android 11+). Grant it from system settings, then return to the app.

On Android ≤10 it requests legacy `READ_EXTERNAL_STORAGE`.

## Notes

- Files load via `file://` URIs. The WebView has `setAllowFileAccess(true)` and JS enabled.
- Only HTML can reference relative assets (CSS/JS/images) inside the same directory; that works because file access is allowed.
- If you want to scope-narrow later, swap MANAGE_EXTERNAL_STORAGE for SAF (`ACTION_OPEN_DOCUMENT_TREE`) — but that requires the user to pick the folder once and stores a tree URI.
