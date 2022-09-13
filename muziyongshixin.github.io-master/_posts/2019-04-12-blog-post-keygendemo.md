---
title: 'Key Generation Demo @ University of Liverpool'
date: 2019-04-12
permalink: /posts/2019/04/12/keygendemo/
categories:
  - Key Generation
  - Final Year Project
tags:
  - Key Generation  
  - Demo
toc: true
---

A WiFi-based key generation demonstration has been developed using WARP board. A full protocol of key generation has been implemented by the Python. This is completed by Mr. Yan Wang as his final year project during 2018 - 2019.

{% include toc %}

# Key Generation Protocol
* Channel Probing:
  * using the Data packet and its corresponding ACK packet to serve as the bidirectional probing packets, implemented based on 802.11 Reference Design: Experiments Framework  . The sampling delay between the Data and ACK is in the order of 10 us therefore a high correlated channel measurements can be obtained.
  * Packet Match: Because the demo is carried out in the office environment, there are many transmissions in the air from other wifi access points. The MAC address is used to filter out the useful packets.
*  Quantization: Mean and standard deviation-based quantization
*  Information Reconciliation: BCH-based secure sketch, BCH code implementation at https://github.com/jkent/python-bchlib used
*  Privacy amplification: hash function SHA256 at https://docs.python.org/3/library/hashlib.html
*  Randomness test: NIST randomness test suite is used. The implementation is based on https://github.com/stevenang/randomness_testsuite

# Setup

<br />
<img align="center" width="1000" src="{{ site.url }}/images/keygen/setup.jpg" alt="...">
<br />

## Hardware
* [WARP v3](http://warpproject.org/trac/wiki/GettingStarted/WARPv3). The WARP hardware setup can be found in this [link](http://warpproject.org/trac/wiki/802.11/wlan_exp/GettingStarted).
* PC
* 1Gb Ethernet switch

## Software
* [802.11 Reference Design: Experiments Framework](http://warpproject.org/trac/wiki/802.11/wlan_exp)
* GUI and signal processing: Python

# Demo
<a href="http://www.youtube.com/watch?feature=player_embedded&v=981pQEnXRCk&" target="_blank"><img src="{{ site.url }}/images/keygen/keygendemo_screenshot.png" alt="Key Generation Demo" width="1000" border="10" /></a>

[comment]: <a href="http://www.youtube.com/watch?feature=player_embedded&v=zcCXj5M2x0k&" target="_blank"><img src="{{ site.url }}/images/keygen/keygendemo_screenshot.png" alt="Key Generation Demo" width="1000" border="10" /></a>

[comment]: <><iframe width="560" height="315" src="http://www.youtube.com/embed/zcCXj5M2x0k" frameborder="0"> </iframe>

