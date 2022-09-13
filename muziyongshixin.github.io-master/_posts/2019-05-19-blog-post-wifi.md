---
title: 'Resources for WiFi'
date: 2019-05-19
permalink: /posts/2019/05/blog-post-wifi/
categories:
  - WiFi
tags:
  - resources
  - WiFi
---

IEEE 802.11 (WiFi) has been used in most of the laptops, smartphones, tablets. The widespread use of WiFi has led to extensive research interests in the area of localization, security, sensing and produced massive successful research outcomes. This paper summarizes some hardware and software resources for WiFi for the research purpose.

Strictly speaking, IEEE 802.11 is the standard by IEEE and WiFi is a trademark of the [WiFi alliance](https://www.wi-fi.org/). However, they are used interchangably in this post.

{% include toc %}

# Standard
IEEE 802.11 standard defines the physcai layer and media access control (MAC) layer protocols. It has undergone a number of amendments in the last twenty years, since its first release in 1997. A complete list of the IEEE 802.11 amendments is summarized at [wikipedia](https://en.wikipedia.org/wiki/IEEE_802.11).

The main physical layer amendments include 802.11b (1999, DSSS), 802.11a (1999, OFDM, 5 GHz), 802.11g (2003, OFDM, 2.4 GHz), 802.11n (2009, MIMO OFDM, high throughput), 802.11ac (2013, MIMO OFDM, very high throughput), 802.11 ax(est late 2019, high efficiency).

# Testbed
The commercial network interfance cards (NICs) only provide received signal strength indicator (RSSI) but not channel state information (CSI). RSSI represents the received power which is averaged over a packet, thus it is a coarse grained parameter. On the other hand, CSI is a fine grained parameter, and offers detailed channel response over different frequencies, when OFDM-based techique is used. Since CSI is much more useful for innovative research, a (incomplete) list of testbed is given below.

## [USRP Software Defined Radio (USRP)](https://www.ettus.com/products/)
* https://www.wime-project.net/
* [IEEE 802.11 a/g/p transceiver for GNU Radio](https://github.com/bastibl/gr-ieee802-11){:target="_blank"}

## [WARP 802.11 Reference Design](http://warpproject.org/trac/wiki/802.11){:target="_blank"}
There is an 802.11 reference design implemented for WARP boards, which is compatible with the commercial WiFi. An [experimental framework](http://warpproject.org/trac/wiki/802.11/wlan_exp) is implemented by Python for the research development. The available variables/parameters can be found [here](http://warpproject.org/trac/wiki/802.11/wlan_exp/log/entry_types), among which the CSI is made public.

_WARP is being actively used for research in many areas like power management, architectures for wireless receivers, physical layer algorithms, access protocols, routing and cognitive radios._ 
A list of papers using WARP can be found at [here](http://warpproject.org/trac/wiki/PapersandPresentations).

## Network Interface Cards
Please note PCI-e interface is required for these NICs.

### Intel 5300 NIC
There is the [Linux 802.11n CSI Tool](https://dhalperi.github.io/linux-80211n-csitool/){:target="_blank"} for Intel 5300 NIC.

This Intel NIC together with the CSI tool have been used extensively by researchers and led to many excellent research papers. A list of the relevant publications can be found at [link](https://dhalperi.github.io/linux-80211n-csitool/#publicationss).

### Atheros Chipsets
There is [Atheros CSI Tool](https://wands.sg/AtherosCSI/){:target="_blank"}.

A list of the relevant publications can be found at [here](https://wands.sg/research/wifi/AtherosCSI/#Users).

# Software Tool
## [Radiotap](https://www.radiotap.org/)
* What is radiotap? [link](http://wifinigel.blogspot.com/2013/11/what-are-radiotap-headers.html)

## [Scapy](https://scapy.net/)
_Scapy is a Python program that enables the user to send, sniff and dissect and forge network packets. This capability allows construction of tools that can probe, scan or attack networks._ (quoated from [link](https://scapy.readthedocs.io/en/latest/introduction.html#about-scapy))

There is a [library](https://github.com/secdev/scapy/blob/master/scapy/layers/dot11.py) supporting IEEE 802.11.

