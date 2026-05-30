---
title: '[PWN College] Intro-to-Arm-Part-1'
description: ''
date: '2026-05-30T15:57:14.089Z'
draft: false
showHeroImage: false
tags: [assembly, XNU]
categories: []
series: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# Level 1

> Similar to amd64, the mov instruction can be used. However, literal values must be prefixed with the # symbol!<br>
> Please set the following:
> **X1 = 0x1337**

It is the same as amd64 syntax, but the name of register is not the same.

`Solve script:`

```python
#!/usr/bin/env python3
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
  mov X1, 0x1337
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()
```

`pwn.college{EUwvpgfk0I9Ixe9UYQDLLLtccQK.dlTM2MDL5QDMxczW}`
