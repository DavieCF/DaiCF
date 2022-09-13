---
title: "Key Generation Introduction"
date: 2019-04-14
permalink: /posts/2019/04/blog-post-keygen_main/
categories:
  - Key Generation
tags:
  - Key Generation
toc: true
---
This page introduces the key general principles and protocol.

{% include toc %}

# Overview

Key generation from the wireless channel has emerged as a promising technique to establish cryptographic keys for legitimate users.

The wireless channel is intrinsic to the environment. The multipath is determined by the direct line-of-sight, reflections, and scatterings, which is affected by the layout, scatter distribution and materials, movement of users or scatterers, etc. Therefore, the features and characteristics of wireless channels are unique and unpredictable. The common randomness residing in the wireless environment between any two users can be leveraged to generate cryptographic keys for the secure communications.

<br />
<img align="center" width="1000" src="{{ site.url }}/images/keygen/keygen_wireless_channel.png" alt="...">
<br />

# Key Generation Principles

Key generation is mainly based on three principles.
* Channel reciprocity means the channel responses of the forward and backward links are the same, which is the basis for key generation. When two users measure the same channel parameters at the same frequency, the measurements will be highly correlated, which guarantees that they will generate the same key.
* Spatial decorrelation indicates that there is randomness residing in the dynamic channel, which ensures the extracted keys are random. A random key will make the cryptographic applications robust against attacks such as brute force.
* Temporal variation implies that when located a half-wavelength away from the legitimate users, the eavesdropper experiences an uncorrelated channel compared to that between Alice or Bob, guaranteeing the security of the key generation. When the system works at 2.4 GHz, a half-wavelength is about 6 cm, which is quite short.
<br />
<img align="center" width="1000" src="{{ site.url }}/images/keygen/keygen_principles.png" alt="...">
<br />

# Key Generation Protocol

A full key generation protocol has been implemented and a demo is developed at Advanced Networks Research Group (ANRG), University of Liverpool. Please refer to the link for detailed information.
<br />
<img align="center" width="1000" src="{{ site.url }}/images/keygen/keygen_protocol.png" alt="...">
<br />

# Reference
Please refer to the following references for a detail introduction and survey.
* Junqing Zhang, Trung Q. Duong, Roger Woods, and Alan Marshall, “Securing wireless communications of the Internet of Things from the physical layer, An overview”, Entropy, vol. 19, no. 8, 420, 2017. (Invited Paper) [link](https://www.mdpi.com/1099-4300/19/8/420)
* Junqing Zhang, Trung Q. Duong, Alan Marshall, and Roger Woods, “Key generation from wireless channels: A review,” IEEE Access, vol. 4, pp. 614- 626, Mar. 2016. Open Access. [link](https://ieeexplore.ieee.org/abstract/document/7393435)
