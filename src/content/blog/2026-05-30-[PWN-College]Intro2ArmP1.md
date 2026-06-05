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

The mov instruction in ARM allows for 2 bytes immediate values, in order to move larger values into a single register, we need to use the movk instruction to load the remaining bytes.  
The movk instruction allows us to specify a bitshift, in this case we use 16 bit left shift for the `0xdead` value.

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

## Level 3

> Arithmetic instructions take three arguments
>
> Example:
> add x0, x1, x2
>
> This example is equivalent to x0 = x1 + x2
>
> Please compute the following:
>
>       f(x) = mx + b, where:
>              m = X0
>              x = X1
>              b = X2
>
> Place the value into X0 given the above.
>
> We will now set the following in preparation for your code:
>
>         X0 = 0xe29
>         X1 = 0x1081
>         X2 = 0x17f8

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

## Level 4

> aarch64 instructions can have multiple arguments and perform multiple actions..Please compute the following:
>
>       f(x) = mx + b, where:
>              m = X0
>              x = X1
>              b = X2
>
> Place the value into X0 given the above.
>
> We will now set the following in preparation for your code:
> X0 = 0x135
> X1 = 0x2108
> X2 = 0x2543
>
> Constraints:
>
>         - You may submit only one instruction.

madd means multiply-add => `x0=(x0*x1)+x2`

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
  madd x0, x0, x1, x2
  """)
with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()
```

`pwn.college{o7ipeuJKzZCEGBp5H7AleXQaTiq.dJjM2MDL5QDMxczW}`

## Level 5

> Modulo in aarch64 cannot be done in a single instruction!
>
> Please compute the following:
> X0 % X1
>
> Place the value in X0.
>
> We will now set the following in preparation for your code:
> X0 = 0x3e8efc7
> X1 = 0x7
>
> Constraints: You may submit 2 instructions.

To make a module operation with only 2 instructions, we need to use `udiv` and `msub`
'udiv' will perform xn / xm, `udiv` returns unsigned value.
'msub x1, x2, x3, x4' will perform x1=(x2\*x3)-x4 for example
Multiply the divisor by the quotient and subtract the result from the dividend.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
  udiv x2, x0, x1
  msub x0, x1, x2, x0
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{grxfmPi7LARRPwnhqc7p9VxCrJS.dNjM2MDL5QDMxczW}`

## Level 6

> Shifting in assembly is another interesting concept! aarch64 allows you to 'shift' bits around in a register. Take for instance, X1. For the sake of this example
>
> say X1 only can store 8 bits (it normally stores 64). The value in X1 is: X1 = 10001010
>
> We if we shift the value once to the left: `lsl X1, X1, 1`
>
> The new value is: `X1 = 00010100`
>
> As you can see, everything shifted to the left and the highest bit fell off and a new 0 was added to the right side.
>
> You can use this to do special things to the bits you care about. It also has the nice side affect of doing quick multiplication, division, and possibly modulo.
>
> Here are the important instructions:
>
>         lsl reg1, reg1, reg2       <=>     Shift reg1 left by the amount in reg2
>         lsr reg1, reg1, reg2       <=>     Shift reg1 right by the amount in reg2
>
> Note: all 'regX' can be replaced by a constant or memory location
>
> Using only the following instructions:
> lsl, lsr
>
> Please perform the following:
> Set X0 to the 4th least significant byte of X0
>
> i.e.
> X1 = | B7 | B6 | B5 | B4 | B3 | B2 | B1 | B0 |
> Set X0 to the value of B3
>
> We will now set the following in preparation for your code:
> X0 = 0x8afa1c2514ec5519

x0 stores 8 bytes = 64 bits
Shift left 32 bits to make x0: `| B3 | B2 | B1 | B0 | 0x0 | 0x0 | 0x0 | 0x0 |`
Then shift right 65 bits to clear B2-B0: `| 0x0 | 0x0 | 0x0 | 0x0 |0x0 | 0x0 | 0x0 | B3 |`

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
  lsl x0, x0, 32
  lsr x0, x0, 56
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{UkwvqCUFkzZldLgrWuwshlcDmq8.dRjM2MDL5QDMxczW}`

## Level 7

> Memory addresses cannot be directly accessed in aarch64. Only registers can be operated on.
>
> Values must be loaded from memory to a register with ldr and written back to memory via str
>
> For example, to increment a value located at memory address 0x1337, the following instructions would be needed:
>
>         mov x1, #0x1337
>         ldr x0, [x1]
>         add x0, x0, #1
>         str x0, [x1]
>
> Locations memory addresses can also be offset from. Example:
> mov x1, #0x4000
> ldr x0, [x1, #8]
>
> Would load 8 bytes stored at 0x4008 into x0
>
> Please perform the following:
>
>         1. Place the value stored at 0x133740004000 into X0
>         2. Place the value stored at 0x133740004008 into X1
>         3. Add these values and store the result at address 0x133740004010
>
> Make sure:
>
>         - The value in X0 is the original value stored at 0x133740004000
>         - The value in X1 is the original value stored at 0x133740004008
>         - [0x133740004010] now has the addition's result.
>
> We will now set the following in preparation for your code:
>
>         [0x133740004000] = 0x1552b7
>         [0x133740004008] = 0x1bbd79

Just loading and storing

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    mov x2, #0x4000
    movk x2, #0x4000, lsl 16
    movk x2, #0x1337, lsl 32

    ldr x0, [x2]
    ldr x1, [x2, #8]

    add x3, x0, x1
    str x3, [x2, #16]
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{QrhZFrQN_F45bHHENkNaYEaow5P.dVjM2MDL5QDMxczW}`

## Level 8

> Consecutive memory addresses can be loaded and stored in a single instruction as a pair!
>
> Please perform the following:
>
>         1. Place the value stored at 0x404000 to the memory location 0x404010
>         2. Place the value stored at 0x404008 to the memory location 0x404018
>
> Constraints:
>
>         - You can only use mov, movk, stp, and ldp
>         - You are allowed four instructions
>
> We will now set the following in preparation for your code:
>
>         [0x404000] = 0x15dfb6
>         [0x404008] = 0x13c798

ldp loads `x0` and `x0+0x8` consecutively and stores in x1, x2
Same as stp

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    mov x0, #0x4000
    movk x0, #0x40, lsl 16
    ldp x1, x2, [x0]
    stp x1, x2, [x0, #0x10]
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{M4ig4xxwt5FX45HGu3y1QbA06tR.dZjM2MDL5QDMxczW}`

## Level 9

> aarch64 does not have the push/pop instructions to work with the stack.
>
> Instead, you must use ldr and str to retrieve values from the stack.
>
> Fortunately, both ldr and str have the ability to increment the address passed in pre/post access.
>
> This feature can be used to perform the same action!
>
> popping the stack would be of the form:
>
>         ldr x1, [sp], #16
>
> This loads the value located at the stack pointer into register x1 and then adds 16 to the stack.
>
> Pushing to the stack would be of the form
>
>         str x1, [sp, #-16]!
>
> This subtracts 16 from the stack pointer and then stores the value in x1 at sp.
>
> Note: In aarch64, the stack pointer must be 16 byte aligned! Accessing the stack pointer when it is not properly aligned will result in a fault!
>
> Note: There is different syntax for accessing memory at an offset, pre-indexing, and post-indexing.
>
> All of these forms are used extensively in aarch64.
>
> Please pop 8 QWORDS from the stack, compute their average, and push the result back onto the stack.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    ldr x1, [sp], #8
    ldr x2, [sp], #8
    ldr x3, [sp], #8
    ldr x4, [sp], #8
    ldr x5, [sp], #8
    ldr x6, [sp], #8
    ldr x7, [sp], #8
    ldr x8, [sp], #8

    add x0, x1, x2
    add x0, x0, x3
    add x0, x0, x4
    add x0, x0, x5
    add x0, x0, x6
    add x0, x0, x7
    add x0, x0, x8
    mov x9, #8
    udiv x0, x0, x9

    str x0, [sp, #-16]!
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{wMW8KgE-a2T-V9q2P6XKzfZg-i5.ddjM2MDL5QDMxczW}`

## Level 10

> Swap values in X0 and X1.
>
> Example:
>
>         If starting with: X0 = 2 and X1 = 5
>         Then end with:    X0 = 5 and X1 = 2
>
> Constraints:
>
> - You may only use two instructions!
>
> We will now set the following in preparation for your code:
>
>         X0 = 0x15f73ff2
>         X1 = 0x915cebb
>
> HINT: You have already used the necessary instructions in previous levels!

We need to store a pair of x0, x1 respectively on stack, then load the line up into x1, x0 respectively.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    stp x0, x1, [sp, #-16]!
    ldp x1, x0, [sp], #16
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{Y6vwA23BOCfkQOrfB9InqgML1fd.dhjM2MDL5QDMxczW}`

## Level 11

> Loops can be created using conditional branch instructions.
>
> The branch instruction in aarch64 is b.
>
> To conditionally branch a dot suffix (ex: .gt) is appended resulting in b.gt.
>
> This would be equivalent to jg in amd64.
>
> Please compute the sum of n consecutive quad words, where:
>
>         X0 = memory address of the 1st quad word
>         X1 = n (amount to loop for)
>
> set x0 to the sum computed
>
> We will now set the following in preparation for your code:
>
>         - [0x4040b8:0x404348] = {n qwords}
>         - X0 = 0x4040b8
>         - X1 = 82

Using post-index addressing to address `x0+0x8` per loop, it will load the value `[x0]` to x3 and do `x0+=8`.
cbnz mean `compare branch if not zero`, if it is positive then loop again instead of terminating the loop.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    mov x2, #0
    loop:
        ldr x3, [x0], #8
        add x2, x2, x3
        sub x1, x1, #1
        cbnz x1, loop
    mov x0, x2
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{8uCKQfFkFgdJL6JIrVIC3Sj4SNk.dljM2MDL5QDMxczW}`

## Level 12

> Loops can be created using conditional branch instructions.
>
> The branch instruction in aarch64 is b.
>
> To conditionally branch a dot suffix (ex: .gt) is appended resulting in b.gt.
>
> This would be equivalent to jg in amd64.
>
> Please compute the sum of n consecutive quad words, where:
>
>         X0 = memory address of the 1st quad word
>         X1 = n (amount to loop for)
>
> set x0 to the sum computed
>
> We will now set the following in preparation for your code:
>
>         - [0x4042a0:0x4044c8] = {n qwords}
>         - X0 = 0x4042a0
>         - X1 = 69
>
> Constraints:
>
>         - You are allowed six instructions
>
> Hints:
>
>         - Take advantage of pre/post indexing when possible.
>         - Use values where they are.
>         - Don't forget to place the result in x0.

Fortunately, the solution is the same as level 11

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    mov x2, #0
    loop:
        ldr x3, [x0], #8
        add x2, x2, x3
        sub x1, x1, #1
        cbnz x1, loop
    mov x0, x2
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{kWdooi1nUht6eVD5dhbKkom2Kz_.dBzM2MDL5QDMxczW}`

## Level 13

> In this level we will ask you to do both a relative jump and an absolute jump. You will do a relative jump first, then an absolute one. You will need to fill space in your code with something to make this relative jump possible.
>
> Using the above knowledge, perform the following:
>
>         1. Make the first instruction in your code a jmp
>         2. Make that jmp a relative jump to 0x40 bytes from its current position
>         3. At 0x40 write the following code:
>         4. Place the top value on the stack into register X1
>         5. jmp to the absolute address 0x403000
>
> We will now set the following in preparation for your code:
>
>         - Loading your given gode at: 0x4000cf
>         - (stack) [0x7fffff1ffff8] = 0xdd

First we have to make a relative jump of 0x40 bytes = 64 bytes
In aarch64, it takes 4 bytes per instruction so we have to add 16 instruction (including the relative jump) to reach 0x40 bytes
Use `br` instruction to make an absolute jump.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    b target
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    nop
    target:
        ldr x1, [sp]
        mov x2, #0x3000
        movk x2, #0x40, lsl 16
        br x2

  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{YTm_hCjMagLaU4UC4fhtlS-ted9.dFzM2MDL5QDMxczW}`

## Level 14

> Function calls in aarch64 are done with the branch and link instruction bl.
>
> The functions return value is stored in register x0.
>
> The bl instruction:
>
>         - does a PC relative jump the specified location
>         - and stores the return address in the link register lr (aka x30)
>
> It is the caller's responsibility to store the existing lr value frame pointer and any needed values in x0 - x15.
>
> Registers x16 - x18 will be discussed later.
>
> Registers x19 - x28 are callee saved.
>
> The saved return address is stored in a special link register lr (aka x30).
>
> The saved frame pointer is stored in a special frame register fr (aka x29).
>
> Given the role of x29 and x30, it is common to see a function prologue similar to:
>
>         stp x29, x30, [sp, #-48]!
>         mov x29, sp
>
> Here, the stack pointer is decremented to create a function frame and lr and fr are stored on the stack. The last instruction shown sets the frame pointer. Note that the stack pointer and frame pointer are equal in this case. local variables are stored ABOVE the frame pointer. The stack pointer may decrement further when passing arguments via the stack or for dynamic stack allocations (alloca).
>
> Similarly, a function epilogue consists of:
>
>         ldp x29, x30, [sp], #48
>         ret
>
> which restores lr, fr and the stack before returning.
>
> Write a function that calculates an average.
>
> Your assembly should be a FUNCTION that will be called, and is expected to return.
>
> Your function should be of the form calc_avg(ptr, count)
>
> where:
>
> - ptr is the start of the array
> - count is the number of 64 bit numbers in the array

x0 and x1 must be the first and second arguments of the function due to the calling coonvention in aarch64
x0 is also the return value of the function.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    mov x2, x0
    mov x3, x1
    mov x4, #0
    loop:
        ldr x5, [x2], #8
        add x4, x4, x5
        sub x3, x3, #1
        cbnz x3, loop
    udiv x0, x4, x1
    ret
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{c0cVsM9ClFq-pgV8KlYjolvG0Fq.dNzM3MDL5QDMxczW}`

## Level 15

> Function calls in aarch64 are done with the branch and link instruction bl.
>
> The functions return value is stored in register x0.
>
> The bl instruction:
>
>         - does a PC relative jump the specified location
>         - and stores the return address in the link register lr (aka x30)
>
> It is the caller's responsibility to store the existing lr value frame pointer and any needed values in x0 - x15.
>
> Registers x16 - x18 will be discussed later.
>
> Registers x19 - x28 are callee saved.
>
> The saved return address is stored in a special link register lr (aka x30).
>
> The saved frame pointer is stored in a special frame register fr (aka x29).
>
> Given the role of x29 and x30, it is common to see a function prologue similar to:
>
>         stp x29, x30, [sp, #-48]!
>         mov x29, sp
>
> Here, the stack pointer is decremented to create a function frame and lr and fr are stored on the stack. The last instruction shown sets the frame pointer. Note that the stack pointer and frame pointer are equal in this case. local variables are stored ABOVE the frame pointer. The stack pointer may decrement further when passing arguments via the stack or for dynamic stack allocations (alloca).
>
> Similarly, a function epilogue consists of:
>
>         ldp x29, x30, [sp], #48
>         ret
>
> which restores lr, fr and the stack before returning.
>
> Write a recursive fibonacci function.
>
> Your assembly should be a FUNCTION that will be called, and is expected to return.
>
> Your function should be of the form fib(pos)
>
> where:
>
> - pos is position in the fibonacci sequence

The prologue stores old Frame Pointer (FP) and Link Register (LR) on stack
Storing argument on `sp+0x10` and the return value on `sp+24` to avoid the values overwritten next time.

```python
from pwn import *
context.arch = 'aarch64'

asm_bytes = asm("""
    fib:
        stp x29, x30, [sp, #-32]!
        mov x29, sp

        str x0, [sp, #16]

        cmp x0, #1                  //end
        b.le base

        sub x0, x0, #1              //n=-1
        bl fib

        str x0, [sp, #24]

        ldr x0, [sp, #16]
        sub x0, x0, #2              //n=-2
        bl fib

        ldr x1, [sp, #24]
        add x0, x0, x1
    base:
        ldp x29, x30, [sp], #32     //epilogue
        ret
  """)

with process('/challenge/run') as p:
  p.send(asm_bytes)
  p.stdin.close()
  p.interactive()

```

`pwn.college{EGOsKvmQn0G2Hbjqyg9hT6YCr7I.dJzM2MDL5QDMxczW}`
