package com.noit.bibeleviewer;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

public class MainActivity extends AppCompatActivity {

    private static final int REQ_LEGACY_PERMS = 1001;
    private static final String BIBLE_DIR = "Bibele";

    private static final String STATE_CURRENT_DIR = "current_dir";
    private static final String STATE_VIEWING_FILE = "viewing_file";
    private static final String STATE_WEBVIEW = "webview_state";

    private WebView webView;
    private ListView fileList;
    private File rootDir;
    private File currentDir;
    private boolean restoredViewingFile = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        fileList = findViewById(R.id.file_list);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setAllowFileAccess(true);
        ws.setAllowContentAccess(true);
        ws.setBuiltInZoomControls(true);
        ws.setDisplayZoomControls(false);
        ws.setUseWideViewPort(true);
        ws.setLoadWithOverviewMode(true);
        ws.setMediaPlaybackRequiresUserGesture(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        rootDir = new File(Environment.getExternalStorageDirectory(), BIBLE_DIR);
        currentDir = rootDir;

        // Restore WebView contents (URL + scroll + history) before any new load.
        if (savedInstanceState != null) {
            Bundle wvState = savedInstanceState.getBundle(STATE_WEBVIEW);
            if (wvState != null) {
                webView.restoreState(wvState);
            }
            String dirPath = savedInstanceState.getString(STATE_CURRENT_DIR);
            if (dirPath != null) {
                File restored = new File(dirPath);
                if (restored.exists() && restored.isDirectory()) {
                    currentDir = restored;
                }
            }
            restoredViewingFile = savedInstanceState.getBoolean(STATE_VIEWING_FILE, false);
        }

        ensureStoragePermission();
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (currentDir != null) {
            outState.putString(STATE_CURRENT_DIR, currentDir.getAbsolutePath());
        }
        boolean viewingFile = webView.getVisibility() == View.VISIBLE;
        outState.putBoolean(STATE_VIEWING_FILE, viewingFile);
        if (viewingFile) {
            Bundle wvState = new Bundle();
            webView.saveState(wvState);
            outState.putBundle(STATE_WEBVIEW, wvState);
        }
    }

    // ---- Action bar buttons ----------------------------------------------

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
        // Home / scroll controls only make sense while a file is open in the WebView.
        boolean viewingFile = webView.getVisibility() == View.VISIBLE;
        menu.findItem(R.id.action_home).setVisible(viewingFile);
        menu.findItem(R.id.action_scroll_up).setVisible(viewingFile);
        menu.findItem(R.id.action_scroll_down).setVisible(viewingFile);
        return super.onPrepareOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_home) {
            // Exit the open file and return to the file chooser for the current folder.
            // Change currentDir to rootDir here if you'd rather jump all the way to /sdcard/Bibele.
            loadDirectory(currentDir != null ? currentDir : rootDir);
            return true;
        } else if (id == R.id.action_scroll_up) {
            webView.pageUp(true);   // true = all the way to the top (HTML page or zoomed image)
            return true;
        } else if (id == R.id.action_scroll_down) {
            webView.pageDown(true); // true = all the way to the bottom
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    // ----------------------------------------------------------------------

    private void ensureStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+: needs MANAGE_EXTERNAL_STORAGE for arbitrary /sdcard access
            if (!Environment.isExternalStorageManager()) {
                new AlertDialog.Builder(this)
                        .setTitle("Storage access needed")
                        .setMessage("This app needs 'All files access' to read /sdcard/" + BIBLE_DIR)
                        .setPositiveButton("Open settings", (d, w) -> {
                            try {
                                Intent i = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                                i.setData(Uri.parse("package:" + getPackageName()));
                                startActivity(i);
                            } catch (Exception e) {
                                startActivity(new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION));
                            }
                        })
                        .setNegativeButton("Cancel", (d, w) -> finish())
                        .setCancelable(false)
                        .show();
                return;
            }
            startupWithPermission();
        } else {
            // Pre-Android 11: legacy READ_EXTERNAL_STORAGE
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.READ_EXTERNAL_STORAGE},
                        REQ_LEGACY_PERMS);
            } else {
                startupWithPermission();
            }
        }
    }

    private void startupWithPermission() {
        if (restoredViewingFile) {
            // WebView state was restored in onCreate; just show it.
            // Title reflects the directory we were browsing before opening the file.
            setTitle(currentDir.getAbsolutePath()
                    .replace(Environment.getExternalStorageDirectory().getAbsolutePath(), "/sdcard"));
            fileList.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            invalidateOptionsMenu();
        } else {
            loadDirectory(currentDir != null ? currentDir : rootDir);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                && Environment.isExternalStorageManager()
                && fileList.getAdapter() == null
                && !restoredViewingFile) {
            startupWithPermission();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_LEGACY_PERMS) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startupWithPermission();
            } else {
                Toast.makeText(this, "Permission denied", Toast.LENGTH_SHORT).show();
                finish();
            }
        }
    }

    private void loadDirectory(File dir) {
        if (!dir.exists()) {
            Toast.makeText(this, "Folder not found: " + dir.getAbsolutePath(), Toast.LENGTH_LONG).show();
            return;
        }
        if (!dir.isDirectory()) {
            openInWebView(dir);
            return;
        }

        currentDir = dir;
        restoredViewingFile = false;
        setTitle(dir.getAbsolutePath().replace(Environment.getExternalStorageDirectory().getAbsolutePath(), "/sdcard"));

        File[] files = dir.listFiles();
        ArrayList<File> entries = new ArrayList<>();
        if (files != null) {
            entries.addAll(Arrays.asList(files));
            Collections.sort(entries, (a, b) -> {
                if (a.isDirectory() != b.isDirectory()) return a.isDirectory() ? -1 : 1;
                return a.getName().compareToIgnoreCase(b.getName());
            });
        }

        ArrayList<String> labels = new ArrayList<>();
        if (!dir.equals(rootDir)) labels.add("../");
        for (File f : entries) {
            labels.add(f.isDirectory() ? f.getName() + "/" : f.getName());
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_list_item_1, labels);
        fileList.setAdapter(adapter);

        fileList.setOnItemClickListener((parent, view, position, id) -> {
            String label = labels.get(position);
            if (label.equals("../")) {
                File parentDir = currentDir.getParentFile();
                if (parentDir != null) loadDirectory(parentDir);
                return;
            }
            int idx = dir.equals(rootDir) ? position : position - 1;
            File picked = entries.get(idx);
            if (picked.isDirectory()) {
                loadDirectory(picked);
            } else {
                openInWebView(picked);
            }
        });

        fileList.setVisibility(View.VISIBLE);
        webView.setVisibility(View.GONE);
        invalidateOptionsMenu();
    }

    private void openInWebView(File file) {
        fileList.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(Uri.fromFile(file).toString());
        invalidateOptionsMenu();
    }

    @Override
    public void onBackPressed() {
        if (webView.getVisibility() == View.VISIBLE) {
            if (webView.canGoBack()) {
                webView.goBack();
            } else {
                loadDirectory(currentDir != null ? currentDir : rootDir);
            }
            return;
        }
        if (currentDir != null && !currentDir.equals(rootDir)) {
            File parent = currentDir.getParentFile();
            if (parent != null) {
                loadDirectory(parent);
                return;
            }
        }
        super.onBackPressed();
    }
}
