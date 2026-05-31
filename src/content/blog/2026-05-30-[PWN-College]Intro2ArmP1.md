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

## Level 1 - Set a register value.

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

## Level 2 - Set a register to a large value.

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

The mov instruction in ARM allows for 2 bytes imediate values, in order to move larger values into a single register, we need to use the movk instruction to load the remaining bytes.  
The movk instruction allows us to specify a bitshift, in this case we use 16 bit left shift for the 0xdead value.

```python
#!/usr/bin/env python3
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
  mov X1, 0xbeef
  movk X1, 0xdead, lsl 16
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()
```

`pwn.college{IO1f0y1tEyHcZY37bXgN4AkS8gc.dBjM2MDL5QDMxczW}`

## Level 3 - Basic arithmetic.

> Arithmetic instructions take three arguments
>
> Example:
> add x0, x1, x2
>
> This example is equivalent to x0 = x1 + x2
>
> Please compute the following:
>
> f(x) = mx + b, where:
> m = X0
> x = X1
> b = X2
>
> Place the value into X0 given the above.
>
> We will now set the following in preparation for your code:
> X0 = 0xe29
> X1 = 0x1081
> X2 = 0x17f8

As the instruction shows, we need 3 arguments for the arithmetic.
In this case, we first mul x0 with x1, then add x0 with x2, the result is stored in x0.

```python
#!/usr/bin/env python3
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
  mul x0, x0, x1
  add x0, x0, x2
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()
```

`pwn.college{sAEEAyQB2XbyBYhl_R87mSk5twD.dFjM2MDL5QDMxczW}`
