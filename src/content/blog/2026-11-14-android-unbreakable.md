---
title: '[MAS-Crackmes] Android UnCrackable'
description: ''
date: '2026-11-14T15:57:14.089Z'
draft: false
tags: [Android, Owasp, Mobile, MAS-Crackmes]
---

First, I noticed that the apk have root detection checking:

![](../images/MAS-Crackmes/img3.png)

Surprisingly that I can open the app without any notification about root detected, I can use the app normally, so lets go to check the 3 methods that detect root:

```java
public static boolean m2a() {
    for (String str : System.getenv("PATH").split(":")) {
        if (new File(str, "su").exists()) {
            return true;
        }
    }
}
```

Method `a()` check the environment variable `PATH` if it contains the file `su`. In default, `su` exists in `/system/xbin` but why it returned `false` in my case. So I check the folder `permission`: `ls -ld /system/xbin`

![](../images/MAS-Crackmes/img4.png)

Turn out the folder does not provide permission to the `Other` user. This process apk app is running as `Other`, it has its own UID because of the Android mechanism when we use `adb shell pm` to install the apk to the emulator. And because the app is `Other` so the OS refuse to query items in the folder => return `false`.

```java
public static boolean m3b() {
    String str = Build.TAGS;
    return str != null && str.contains("test-keys");
}
```

I use `Frida` to extract the information of the `Build.TAGS`

```javascript
Java.perform(function () {
  var File = Java.use('java.io.File');
  var path = Java.use('java.lang.System').getenv('PATH');
  console.log('Build.TAGS = ' + Java.use('android.os.Build').TAGS.value);
});
```
![](../images/MAS-Crackmes/img5.png)

The value does not contain `test-keys` so returning `false`. The reason is I use the standard `AVD` and `Build.TAGS` key is `dev-keys` in default.

```java
public static boolean m4c() {
    for (String str : new String[]{"/system/app/Superuser.apk", "/system/xbin/daemonsu", "/system/etc/init.d/99SuperSUDaemon", "/system/bin/.ext/.su", "/system/etc/.has_su_daemon", "/system/etc/.installed_su_daemon", "/dev/com.koushikdutta.superuser.daemon/"}) {
        if (new File(str).exists()) {
            return true;
        }
    }
    return false;
}
```

The method `c()` harcord paths which are determined as root. This is an old technique for root detection.

# Android UnCrackable L1

Check the source code of MainActivity:

```java
public class MainActivity extends Activity {
    /* JADX INFO: renamed from: a */
    private void m5a(String str) {
        AlertDialog alertDialogCreate = new AlertDialog.Builder(this).create();
        alertDialogCreate.setTitle(str);
        alertDialogCreate.setMessage("This is unacceptable. The app is now going to exit.");
        alertDialogCreate.setButton(-3, "OK", new DialogInterface.OnClickListener() { // from class: sg.vantagepoint.uncrackable1.MainActivity.1
            @Override // android.content.DialogInterface.OnClickListener
            public void onClick(DialogInterface dialogInterface, int i) {
                System.exit(0);
            }
        });
        alertDialogCreate.setCancelable(false);
        alertDialogCreate.show();
    }

    @Override // android.app.Activity
    protected void onCreate(Bundle bundle) {
        if (C0002c.m2a() || C0002c.m3b() || C0002c.m4c()) {
            m5a("Root detected!");
        }
        if (C0001b.m1a(getApplicationContext())) {
            m5a("App is debuggable!");
        }
        super.onCreate(bundle);
        setContentView(R.layout.activity_main);
    }

    public void verify(View view) {
        String str;
        String input_string = ((EditText) findViewById(R.id.edit_text)).getText().toString();
        AlertDialog alertDialogCreate = new AlertDialog.Builder(this).create();
        if (C0005a.m6a(input_string)) {
            alertDialogCreate.setTitle("Success!");
            str = "This is the correct secret.";
        } else {
            alertDialogCreate.setTitle("Nope...");
            str = "That's not it. Try again.";
        }
        alertDialogCreate.setMessage(str);
        alertDialogCreate.setButton(-3, "OK", new DialogInterface.OnClickListener() { // from class: sg.vantagepoint.uncrackable1.MainActivity.2
            @Override // android.content.DialogInterface.OnClickListener
            public void onClick(DialogInterface dialogInterface, int i) {
                dialogInterface.dismiss();
            }
        });
        alertDialogCreate.show();
    }
}
```

The goal is to make the code `C0005a.m6a(input_string)` return the value `True`.

Check the source code of the class `C0005a`:

```java
public class C0005a {
    /* JADX INFO: renamed from: a */
    public static boolean m6a(String input_string) {
        byte[] target;
        byte[] bArr = new byte[0];
        try {
            target = C0000a.m0a(m7b("8d127684cbc37c17616d806cf50473cc"), Base64.decode("5UJiFctbmgbDoLXmpL12mkno8HT4Lv8dlat8FxR2GOc=", 0));
        } catch (Exception e) {
            Log.d("CodeCheck", "AES error:" + e.getMessage());
            target = bArr;
        }
        return input_string.equals(new String(target));
    }

    /* JADX INFO: renamed from: b */
    public static byte[] m7b(String str) {
        int length = str.length();
        byte[] bArr = new byte[length / 2];
        for (int i = 0; i < length; i += 2) {
            bArr[i / 2] = (byte) ((Character.digit(str.charAt(i), 16) << 4) + Character.digit(str.charAt(i + 1), 16));
        }
        return bArr;
    }
}
```

The return value of `m6a` is True if the value entered by the user equals `target` in String form.

We see that the `m0a` method of class `C0000a` takes two input parameters: `m7b("8d127684cbc37c17616d806cf50473cc")` and `Base64.decode("5UJiFctbmgbDoLXmpL12mkno8HT4Lv8dlat8FxR2GOc=", 0)`

`C0000a`:

```java
public class C0000a {
    /* JADX INFO: renamed from: a */
    public static byte[] m0a(byte[] bArr, byte[] bArr2) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(bArr, "AES/ECB/PKCS7Padding"); // declare secret key
        Cipher cipher = Cipher.getInstance("AES"); // create object for encryption
        cipher.init(2, secretKeySpec);
        return cipher.doFinal(bArr2); // use secretkey to decrypt bArr2
    }
}
```

`bArr` is exactly `m7b("8d127684cbc37c17616d806cf50473cc")`, which is used as the key to decrypt `Base64.decode("5UJiFctbmgbDoLXmpL12mkno8HT4Lv8dlat8FxR2GOc=", 0)` (because the second parameter in `cipher.init()` is `DECRYPT_MODE`) using `AES`. Therefore, we can decrypt it with `Cyberchef`.

![](../images/MAS-Crackmes/img1.png)

=> The decrypted result is `I want to believe`

`C0000a.m0a` returns the byte array into the `target` variable. Then `target` is cast to a String and compared for equality with the String entered by the user, and it returns True if the two strings are equal.

![](../images/MAS-Crackmes/img2.png)

# Android UnCrackable L2
