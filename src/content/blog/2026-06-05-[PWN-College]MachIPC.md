---
title: '2026 06 05 [PWN College]MachIPC'
description: ''
date: '2026-06-05T07:04:46.150Z'
draft: false
showHeroImage: false
tags: [mach, pwn-college]
categories: [mach]
series: [pwn-college]
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

# Mach IPC

## Level 1

> For this level, just send any message to this port.

> `mach_port_allocate()` created port right name 2563
>
> `mach_port_insert_right()` inserted a send right
>
> `bootstrap_register()` to college.pwn.mac-ports.50

```c
#include <stdio.h>
#include <mach/mach.h>
#include <servers/bootstrap.h>

int main(){
    mach_port_t bootstrap_port, server_port;
    kern_return_t kr;
    kr = task_get_bootstrap_port(mach_task_self(), &bootstrap_port);
    if(kr != KERN_SUCCESS){
        printf("bootstrap port fail");
        return 1;
    }
    kr = bootstrap_look_up(bootstrap_port, "college.pwn.mac-ports.50", &server_port);
    if(kr != KERN_SUCCESS){
        printf("look up fail");
        return 1;
    }
    mach_msg_header_t msg = {0};
    msg.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, 0);
    msg.msgh_remote_port = server_port;
    msg.msgh_size = sizeof(msg);

    kr = mach_msg(&msg, MACH_SEND_MSG, sizeof(msg), 0, MACH_PORT_NULL, 0, MACH_PORT_NULL);
    printf("Sending...");
    // pwn.college{0xHVlui6FBFpEPTVLe0etC_vHu1.dNTO2kDL5QDMxczW}
}
```

## Level 2

> For this level, just send any message to this port.

Use `lldb` debugger to look for `bootstrap_register()` to find the service name

```c
#include <stdio.h>
#include <mach/mach.h>
#include <servers/bootstrap.h>

int main(){
    mach_port_t bootstrap_port, server_port;
    kern_return_t kr;
    kr = task_get_bootstrap_port(mach_task_self(), &bootstrap_port);
    if(kr != KERN_SUCCESS){
        printf("bootstrap port fail");
        return 1;
    }
    kr = bootstrap_look_up(bootstrap_port, "college.pwn.mac-ports.7f", &server_port);
    if(kr != KERN_SUCCESS){
        printf("look up fail");
        return 1;
    }
    mach_msg_header_t msg = {0};
    msg.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, 0);
    msg.msgh_remote_port = server_port;
    msg.msgh_size = sizeof(msg);

    kr = mach_msg(&msg, MACH_SEND_MSG, sizeof(msg), 0, MACH_PORT_NULL, 0, MACH_PORT_NULL);
    printf("Sending...");
    return 0;
    // pwn.college{Qr5G4dszRi06vjJywjCX6O9qXMG.dRTO2kDL5QDMxczW}
}
```

## Level 3

> Now, send a specific inline message to this port.

> `mach_port_allocate()` created port right name 5123
>
> `mach_port_insert_right()` inserted a send right
>
> `bootstrap_register()` to college.pwn.mac-ports.8d

The msg header does not contain `value` field in default so we should create the own mach_msg struct that contians `value` field

```c
typedef struct {
    mach_msg_bits_t               msgh_bits;
    mach_msg_size_t               msgh_size;
    mach_port_t                   msgh_remote_port;
    mach_port_t                   msgh_local_port;
    mach_port_name_t              msgh_voucher_port;
    mach_msg_id_t                 msgh_id;
} mach_msg_header_t;
// https://github.com/apple-oss-distributions/xnu/blob/main/osfmk/mach/message.h
```

Debug `challenge()` function, we can see this block of code:

```assembly
    send-value-to-port-0[0x100003994] <+544>: ldr    x9, [sp, #0x20]
    send-value-to-port-0[0x100003998] <+548>: ldr    x8, [sp, #0x40]
    send-value-to-port-0[0x10000399c] <+552>: subs   x8, x8, x9
    send-value-to-port-0[0x1000039a0] <+556>: cset   w8, eq
    send-value-to-port-0[0x1000039a4] <+560>: tbnz   w8, #0x0, 0x1000039d4     ; <+608>
```

It will compare x9 and x8 stored on the stack, x9 is the value we need to look for at `[sp, #0x20]`

```assembly
    send-value-to-port-0[0x100003780] <+12>:  mov    x8, #0xe0aa
    send-value-to-port-0[0x100003784] <+16>:  movk   x8, #0x2635, lsl #16
    send-value-to-port-0[0x100003788] <+20>:  movk   x8, #0x71f0, lsl #32
    send-value-to-port-0[0x10000378c] <+24>:  movk   x8, #0x6c1a, lsl #48
    send-value-to-port-0[0x100003790] <+28>:  str    x8, [sp, #0x20]
```

So the specific value is `0x6c1a71f02635e0aa`

```c
#include <stdio.h>
#include <mach/mach.h>
#include <servers/bootstrap.h>
typedef struct{
    mach_msg_header_t header;
    uint64_t value;
} my_msg_t;
int main(){
    mach_port_t bootstrap_port, server_port;
    kern_return_t kr;
    kr = task_get_bootstrap_port(mach_task_self(), &bootstrap_port);
    if(kr != KERN_SUCCESS){
        printf("bootstrap port fail");
        return 1;
    }
    kr = bootstrap_look_up(bootstrap_port, "college.pwn.mac-ports.8d", &server_port);
    if(kr != KERN_SUCCESS){
        printf("look up fail");
        return 1;
    }
    my_msg_t msg = {0};
    msg.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, 0);
    msg.header.msgh_remote_port = server_port;
    msg.header.msgh_size = sizeof(msg);
    msg.value = 0x6c1a71f02635e0aa;

    kr = mach_msg(&msg, MACH_SEND_MSG, sizeof(msg), 0, MACH_PORT_NULL, 0, MACH_PORT_NULL);
    printf("Sending...");
    return 0;
    // pwn.college{A9PXd6YbcK1CUa8fdAHGRXhqLKr.dVTO2kDL5QDMxczW}
}
```
