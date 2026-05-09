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
    private static final String BIBLE_DIR = "/Bibele/bibele_andr";

    private WebView webView;
    private ListView fileList;
    private File rootDir;
    private File currentDir;

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

        ensureStoragePermission();
    }

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
            loadDirectory(rootDir);
        } else {
            // Pre-Android 11: legacy READ_EXTERNAL_STORAGE
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.READ_EXTERNAL_STORAGE},
                        REQ_LEGACY_PERMS);
            } else {
                loadDirectory(rootDir);
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R
                && Environment.isExternalStorageManager()
                && fileList.getAdapter() == null) {
            loadDirectory(rootDir);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_LEGACY_PERMS) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                loadDirectory(rootDir);
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
    }

    private void openInWebView(File file) {
        fileList.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(Uri.fromFile(file).toString());
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
