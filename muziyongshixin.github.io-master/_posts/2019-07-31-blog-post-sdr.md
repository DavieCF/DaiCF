---
title: 'Software Defined Radio'
date: 2019-07-31
permalink: /posts/2019/07/blog-post-sdr/
categories:
  - Resources
tags:
  - Resources
  - Software Defined Radio
---

This page summarizes information for software defined radio (SDR).

# Overview
*Radio components such as modulators, demodulators and tuners are traditionally implemented in hardware components. The advent of modern computing and analogue to digital converters allows most of these traditionally hardware based components to be implemented into software instead. Hence, the term software defined radio. This enables easy signal processing and thus cheap wide band scanner radios to be produced.* (quoted from [https://www.rtl-sdr.com/about-rtl-sdr/](https://www.rtl-sdr.com/about-rtl-sdr/){:target="_blank"})

An good (though not the latest) introduction on the SDR is available [here](http://www.taylorkillian.com/2013/08/sdr-showdown-hackrf-vs-bladerf-vs-usrp.html){:target="_blank"})

# Hardware
There are many SDR platforms available on the market, with different specifications and prices. A comparsion between different SDR is produced by LimeSDR and quoted here. Source: [https://www.crowdsupply.com/lime-micro/limesdr-mini#comparison-table](https://www.crowdsupply.com/lime-micro/limesdr-mini#comparison-table){:target="_blank"}

| Item                     | HackRF One                  | Ettus B200          | Ettus B210          | BladeRF x40         | RTL-SDR          | LimeSDR                           | LimeSDR Mini                        |
|--------------------------|-----------------------------|---------------------|---------------------|---------------------|------------------|-----------------------------------|-------------------------------------|
| Frequency Range          | 1 MHz - 6 GHz               | 70 MHz - 6 GHz      | 70 MHz - 6 GHz      | 300 MHz - 3.8 GHz   | 22 MHz - 2.2 GHz | 100 kHz - 3.8 GHz                 | 10 MHz - 3.5 GHz                    |
| RF Bandwidth             | 20 MHz                      | 61.44 MHz           | 61.44 MHz           | 40 MHz              | 3.2 MHz          | 61.44 MHz                         | 30.72 MHz                           |
| Sample Depth             | 8 bit                       | 12 bit              | 12 bit              | 12 bit              | 8 bit            | 12 bit                            | 12 bit                              |
| Sample Rate              | 20 MSPS                     | 61.44 MSPS          | 61.44 MSPS          | 40 MSPS             | 3.2 MSPS         | 61.44 MSPS                        | 30.72MSPS                           |
| TX Channels              | 1                           | 1                   | 2                   | 1                   | 0                | 2                                 | 1                                   |
| RX Channels              | 1                           | 1                   | 2                   | 1                   | 1                | 2                                 | 1                                   |
| Duplex                   | Half                        | Full                | Full                | Full                | N/A              | Full                              | Full                                |
| Interface                | USB 2.0                     | USB 3.0             | USB 3.0             | USB 3.0             | USB 2.0          | USB 3.0                           | USB 3.0                             |
| Programmable Logic Gates | 64 macrocell CPLD           | 75k                 | 100k                | 40k (115k avail)    | N/A              | 40k                               | 16K                                 |
| Chipset                  | MAX5864, MAX2837, RFFC5072  | AD9364              | AD9361              | LMS6002M            | RTL2832U         | LMS7002M                          | LMS7002M                            |
| Open Source              | Full                        | Schematic, Firmware | Schematic, Firmware | Schematic, Firmware | No               | Full                              | Full                                |
| Oscillator Precision     | +/- 20 ppm                  | +/- 2 ppm           | +/- 2 ppm           | +/- 1 ppm           | ?                | +/-1 ppm initial, +/-4 ppm stable | +/- 1 ppm initial, +/- 4 ppm stable |
| Transmit Power           | -10 dBm+ (15 dBm @ 2.4 GHz) | 10 dBm+             | 10 dBm+             | 6 dBm               | N/A              | max 10 dBm (depending on freq.)   | max 10 dBm (depending on freq.)     |
| Price                    | $299                        | $686                | $1,119              | $420                | ~$10             | $299                              | $159                                |



## Universal Software Radio Peripheral (USRP)
USRP has different series, including network series, bus series, embedded series. A selection guide is given in [https://kb.ettus.com/Selecting_an_USRP_Device](https://kb.ettus.com/Selecting_an_USRP_Device){:target="_blank"}

Some USRP series do not have RF capabilities, e.g., the N210 USRP. A separate RF daughterboard will be required.
* RF Daughterboard Selection: Not all the USRP is equpped with the RF card, including N and X series. A selection guide is provided at [https://kb.ettus.com/Selecting_an_RF_Daughterboard](https://kb.ettus.com/Selecting_an_RF_Daughterboard){:target="_blank"}

## [LimeSDR](https://www.crowdsupply.com/lime-micro/limesdr){:target="_blank"}

## [RTL-SDR](https://www.rtl-sdr.com/about-rtl-sdr/){:target="_blank"}

## [Wireless Open Access Research Platform (WARP)](http://warpproject.org/trac){:target="_blank"}
Strictly speaking, WARP is not an SDR platform, because it uses a WiFi chipset MAX2829. There are two reference designs, namely 802.11 reference design and WARPLab reference design. The driver has been developed for both designs and the users can simply focus on developing their applications and prototypes.
* WARP 802.11 reference design is compatible with the commercial WiFi standard. The PHY and MAC codes are running at the FPGA. An experimental framework has been developed with two WARP boards connecting to a PC via a Ethernet switch. Python has been used. A more detailed introduction can be found at link
* WARPLab reference design is very suitable for fast prototype of physical layer algorithm. Two or more WARP boards are connected to a PC via a Ethernet switch.  The signal is modulated at the Matlab, then transferred to WARP transmitter via Ethernet cable. The data is triggered for transmission through the real wireless channel. The WARP receiver captures the signal and transfer it to the PC/Matlab via Ethernet cable for further processing.

# Development Tool

## GNU Radio
[Tutorial](https://wiki.gnuradio.org/index.php/Tutorials){:target="_blank"}

