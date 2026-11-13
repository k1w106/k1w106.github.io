---
title: '[MASTG-APP-0007] DIVA Android'
description: ''
date: '2026-11-10T15:57:14.089Z'
draft: false
tags: [Android, Owasp, Mobile]
---

# Insecure Logging

```java
public void checkout(View view) {
    EditText cctxt = (EditText) findViewById(C0308R.id.ccText);
    try {
        processCC(cctxt.getText().toString());
    } catch (RuntimeException e) {
        Log.e("diva-log", "Error while processing transaction with credit card: " + cctxt.getText().toString());
        Toast.makeText(this, "An error occured. Please try again later", 0).show();
    }
}
private void processCC(String ccstr) {
    RuntimeException e = new RuntimeException();
    throw e;
}
```

Activity `LogActivity` sẽ tương tác với thành phần EditText, chính là ô input của user. Sau đó, hàm call `processCC()`. Hàm này mặc định ném 1 RuntimeException và khi `checkout()` bắt được, hàm sẽ ghi vào log gồm dòng `"Error while processing transaction with credit card:" + cctxt`. Đây sẽ là thông tin nhạy cảm của user và gây nguy hiểm nếu người khác có quyền truy cập log.

```
2026-11-12 09:00:14.456 20755-20755 diva-log jakhar.aseem.diva Error while processing transaction with credit card: 1234562
```

# Hardcoding issues - Part 1
