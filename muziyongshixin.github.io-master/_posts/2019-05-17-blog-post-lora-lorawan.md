---
title: 'Resources for LoRa and LoRaWAN'
date: 2019-05-17
permalink: /posts/2019/05/blog-post-lora-lorawan/
categories:
  - LoRaWAN
tags:
  - resources
  - lorawan
---

This paper summarizes resources for LoRa and LoRaWAN.
<figure>
  <img src="{{site.url}}/images/lorawan/lorawan_architecture.png" alt="LoRaWAN Architecture"/>
  <figcaption>LoRaWAN Architecture. Source: Page 8 of the white paper  <a href="https://lora-alliance.org/sites/default/files/2018-04/what-is-lorawan.pdf" title="A technical overview of LoRa® and LoRaWAN™">A technical overview of LoRa® and LoRaWAN™"</a> </figcaption>
</figure>

{% include toc %}

# Overview
LoRa is a new IoT technique which is very suitable for energy efficient and long range communications.
Sometimes peopole use LoRa as the physical layer modualtion technique while LoRaWAN as the MAC protocol and also the network structure. In other cases, you may also see that LoRa is used as a general term to represent LoRa/LoRaWAN. 
A good tutorial and summary of the LoRa and LoRaWAN can be found at [link](https://medium.com/coinmonks/lpwan-lora-lorawan-and-the-internet-of-things-aed7d5975d5d){:target="_blank"}.

# LoRa
LoRa (Long Range) is an IoT wireless technology patented by [Smetech](https://www.semtech.com/lora){:target="_blank"}. It defines the physical layer modulation.

## Understand LoRa modulation
* LoRa modem with LimeSDR [Link](https://myriadrf.org/news/lora-modem-limesdr/){:target="_blank"}
* Understanding LoRa RF modulation [link](https://revspace.nl/DecodingLora){:target="_blank"}

# LoRaWAN
LoRaWAN is a media access control (MAC) protocol for wide area networks. It is defined by [LoRa Alliance](https://lora-alliance.org/){:target="_blank"}

LoRaWAN is not the only MAC protocol for LoRa. Symphony Link is also available. A difference between Symphony Link and LoRaWAN can be found [here](https://www.link-labs.com/whitepaper-symphony-link-vs-lorawan?hsCtaTracking=e10ced9e-aeca-4846-938a-7332bcf2e515%7C016f5d73-fc31-4196-835a-1f573372d5bb){:target="_blank"}

## Standard
The first LoRaWAN specification was published on January 2015 ([download link](https://lora-alliance.org/sites/default/files/2018-05/2015_-_lorawan_specification_1r0_611_1.pdf)) and the lastest LoRaWAN specifications is LoRaWAN® Specification v1.0.3 (July 2018) [download link](https://lora-alliance.org/lorawan-for-developers){:target="_blank"}.

Many LoRaWAN protocol implementations may not support the lastest version. For example, [pycom devices only support LoRaWAN 1.0.2](https://docs.pycom.io/firmwareapi/pycom/network/lora.html). The previous versions of LoRaWAN specifications  can be accessed from [https://lora-alliance.org/resource-hub](https://lora-alliance.org/resource-hub)


## Tutorial
* [LoRaWAN Overview by TTN](https://www.thethingsnetwork.org/docs/lorawan/){:target="_blank"}
* mbed tutorial: Building a private LoRa network [link](https://os.mbed.com/docs/mbed-os/v5.12/tutorials/LoRa-tutorial.html){:target="_blank"}
* LoRaWAN network architecture [link](https://os.mbed.com/docs/mbed-os/v5.12/reference/lora-tech.html){:target="_blank"}

## LoRaWAN Network Server
* Public Network Server	
	* [The Things Network](https://www.thethingsnetwork.org/){:target="_blank"} 
* Private Network Server	
	* Tutorial: TTN: Setting up a Private Routing Environment
 [link](https://www.thethingsnetwork.org/article/setting-up-a-private-routing-environment){:target="_blank"}
	* [loraserver](https://www.loraserver.io/){:target="_blank"}
	

## LoRaWAN Demo at University of Liverpool
A LoRaWAN demo has been created at the Adavenced Networks Research Group (ANRG), University of Liverpool. The demo built a complete LoRaWAN-based IoT system, including FiPy end devices, gateway, and applications.
A detailed introduction can be found at [link](https://junqing-zhang.github.io/posts/2019/04/blog-post-lorawan-fipy-demo/){:target="_blank"}. 

A public LoRaWAN gateway hosted at The Things Network by ANRG [Link](https://www.thethingsnetwork.org/u/anrg){:target="_blank"}. The gateway was built following the instruction [here](https://www.thethingsnetwork.org/labs/story/rak831-lora-gateway-from-package-to-online){:target="_blank"}

# Resources
## Hardware
* mbed LoRa device [(link)](https://os.mbed.com/cookbook/LoRa){:target="_blank"}
* Micropython-based devices: [FiPy](https://pycom.io/product/fipy/){:target="_blank"}, [LoPy](https://pycom.io/product/lopy4/){:target="_blank"},

## Development tool
* mbed LoRaWAN APIs [link](https://os.mbed.com/docs/mbed-os/v5.12/apis/lorawan.html){:target="_blank"}
* Arduino LMIC [link](https://github.com/matthijskooijman/arduino-lmic){:target="_blank"}
* Arduino RadioHead (not supporting LoRaWAN) [link](https://www.airspayce.com/mikem/arduino/RadioHead/classRH__RF95.html){:target="_blank"}
* Pycom micropython LoRa/LoRaWAN modules [link](https://docs.pycom.io/firmwareapi/pycom/network/lora.html){:target="_blank"}

# FAQ
* 14 LoRa FAQs Answered from LinkLabs [https://www.link-labs.com/blog/lora-faqs](https://www.link-labs.com/blog/lora-faqs)


