package com.souqi.store;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();

        // JavaScript
        settings.setJavaScriptEnabled(true);

        // التخزين المحلي
        settings.setDomStorageEnabled(true);

        // السماح بملفات التطبيق
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // تحسين عرض الموقع
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(false);

        // إبقاء الروابط داخل التطبيق
        webView.setWebViewClient(new WebViewClient());

        // فتح شاشة تسجيل الدخول
        webView.loadUrl("file:///android_asset/login.html");
    }

    @Override
    public void onBackPressed() {

        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}