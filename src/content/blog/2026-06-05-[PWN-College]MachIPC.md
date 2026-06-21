---
title: '[PWN College] Mach IPC'
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
>
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
>
> `mach_port_allocate()` created port right name 5123
>
> `mach_port_insert_right()` inserted a send right
>
> `bootstrap_register()` to college.pwn.mac-ports.8d

The msg header does not contain `value` field in default so we should create the own mach_msg struct that contains `value` field

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

## Level 4

The solution is similar to the previous challenge.

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
    kr = bootstrap_look_up(bootstrap_port, "college.pwn.mac-ports.1f", &server_port);
    if(kr != KERN_SUCCESS){
        printf("look up fail");
        return 1;
    }
    my_msg_t msg = {0};
    msg.header.msgh_bits = MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, 0);
    msg.header.msgh_remote_port = server_port;
    msg.header.msgh_size = sizeof(msg);
    msg.value = 0x502ced1908d4871f;

    kr = mach_msg(&msg, MACH_SEND_MSG, sizeof(msg), 0, MACH_PORT_NULL, 0, MACH_PORT_NULL);
    printf("Sending...");
    return 0;
    // pwn.college{UJuL_N_mSq2xQlYVxzDH0UbtFbE.dZTO2kDL5QDMxczW}
}
```

## Level 5

> Now, send any OOL message to this port.
>
> mach_port_allocate() created port right name 5123
>
> mach_port_insert_right() inserted a send right
>
> bootstrap_register() to college.pwn.mac-ports.18

Unlike `Inline message` used in previous levels, `OOL message (Out of line message)` has different format and how it works.

`Inline message` manually copies data in the extra field that we provide into the buffer. This is not effective if it is a 10MB data for example and there are multiple senders, that means the kernel have to manually copies large amount of bytes.

`Out of line message (OOL)` solves this problem. It locates the address of the buffer instead of directly store the buffer, making this message dynamic and optimize.

OOL Message descriptor is where all the body information of the message:

```c
typedef struct{
  void* address;
#if !defined(__LP64__)
  mach_msg_size_t size;
#endif
  boolean_t deallocate: 8;
  mach_msg_copy_options_t copy: 8;
  unsigned int pad1: 8;
  mach_msg_descriptor_type_t type: 8;
#if defined(__LP64__)
  mach_msg_size_t size;
#endif
} mach_msg_ool_descriptor_t;
```

- `address` of the out-of-line data
- `size` of the data
- `deallocate`, when true the memory page at the address will be removed from the sender’s address space once the message’s been sent
- `copy` defines the way of copying the memory
- `type` of the message descriptor, for the OOL descriptor, it’s MACH_MSG_OOL_DESCRIPTOR

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <mach/mach.h>
#include <servers/bootstrap.h>
typedef struct {
    mach_msg_header_t header;
    mach_msg_size_t msgh_descriptor_count;
    mach_msg_ool_descriptor_t descriptor;
} OOLMessage;
int main(){
    mach_port_t bootstrap_port, server_port;
    kern_return_t kr;
    kr = task_get_bootstrap_port(mach_task_self(), &bootstrap_port);
    if(kr != KERN_SUCCESS){
        printf("bootstrap port fail");
        return 1;
    }
    kr = bootstrap_look_up(bootstrap_port, "college.pwn.mac-ports.18", &server_port);
    if(kr != KERN_SUCCESS){
        printf("look up fail");
        return 1;
    }
    // OOL message
    char* buffer = malloc(0x50);
    strcpy(buffer, "aaaa");
    OOLMessage msg = {0};
    msg.header.msgh_bits = MACH_MSGH_BITS_COMPLEX | MACH_MSGH_BITS(MACH_MSG_TYPE_COPY_SEND, 0);
    msg.header.msgh_remote_port = server_port;
    msg.header.msgh_size = sizeof(msg);
    msg.msgh_descriptor_count = 1;
    msg.descriptor.address = buffer;
    msg.descriptor.size = 0x50;
    msg.descriptor.deallocate = false;
    msg.descriptor.copy = MACH_MSG_VIRTUAL_COPY;
    msg.descriptor.type = MACH_MSG_OOL_DESCRIPTOR;
    kr = mach_msg(&msg.header, MACH_SEND_MSG, sizeof(msg), 0, MACH_PORT_NULL, 0, MACH_PORT_NULL);
    printf("Sending...");
    // pwn.college{4zNZo7EL7iGfYcDFk667dJxm9-5.ddTO2kDL5QDMxczW}}
}
```
