---
title: '[MASTG-APP-0007] DIVA Android'
description: ''
date: '2026-11-10T15:57:14.089Z'
draft: false
showHeroImage: false
tags: [Android, Owasp]
categories: [Android]
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# Insecure Logging

![](../images/diva/img1.png)

Activity `LogActivity` sẽ tương tác với thành phần `EditText`, chính là ô input của user. Sau đó, hàm call `processC()`. Hàm này mặc định ném 1 RuntimeException và khi `checkout()` bắt được, hàm sẽ ghi vào log gồm dòng string + `cctxt`. Đây sẽ là thông tin nhạy cảm của user và gây nguy hiểm nếu người khác có quyền truy cập log.

![](../images/diva/img2.png)
