---
title: '[PWN College] Introduction-to-ARM-Part-1'
description: ''
date: '2026-05-30T15:57:14.089Z'
draft: false
showHeroImage: false
tags: [assembly, pwn-college]
categories: [assembly]
series: [pwn-college]
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# Introduction to ARM Part 1

## Level 1

> Similar to amd64, the mov instruction can be used. However, literal values must be prefixed with the # symbol!
>
> Please set the following: **X1 = 0x1337**

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

## Level 2

> aarch64 registers are 64 bits in size, but the mov instruction only works with 16 bit immediate values.
>
> In order to move larger literal values, the mov and movk instructions are needed.
>
> movk loads a value into the destination register with a specific bitshift, retaining all other bytes
>
> Example:
>
>         mov x0, #0x3700
>         movk x0, #0x13, lsl 16
>
> Results in X0 containing the value 0x133700
>
> Please set the following: **X1 = 0xdeadbeef**
