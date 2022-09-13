---
layout: archive
title: 'Research Areas'
permalink: /research-areas/
author_profile: true
---

I have developed a strong research potential in innovative computer vision application and deep learning algorithm.
My current research mainly focuses on fine-grained cross-modal retrieval and matching, including the mining of higher-order and complex semantic information and some hashing related work.
My research interests also include the application of AI technology in the medical field and other security and privacy-related applications like video steganography.

 <!-- My research aims to bridge the gap between the theoretical modelling and practical exploitation of physical layer security using state-of-the-art testbeds and equipment. -->
<!-- In particular, my research aims to ensure the secure connection using key generation and device authentication using radio frequency fingerprint identification. -->

## Cross-Modal Retrieval/Matching

- Cross-Modal Retrieval (CMR) aims to search semantically similar instances in one modality (e.g.,text) by using a query from another modality (e.g.,image). Since different modality instances come from heterogeneous data sources with different distributions,it has posed new challenges to efficiently and effectively unify different modalities and bridge their semantic gaps.
Here are some introduction and summary about this topic:
[[Survey](https://arxiv.org/abs/1607.06215)]
[[Link1](https://zhuanlan.zhihu.com/p/115273380)]
[[Link2](https://zhuanlan.zhihu.com/p/117644099)]
[[Link3](https://zhuanlan.zhihu.com/p/129857640)]
[[Link4](https://zhuanlan.zhihu.com/p/92705250)]
<img align="center" width="800" src="{{ site.url }}/images/cmr/cross_modal_retrieval.jpg" alt="cross modal retrieval pipline">
<!-- * [Key Generation Overview]({{ site.url }}/posts/2019/04/blog-post-keygen_main/) -->

## Image/Video Steganography

- Steganography represents the art of unobtrusively concealing a secret message within some cover data. With the development of deep learning technology, current algorithm can hide an entire image or video into another corresponding carrier (image/video) without being noticed by the human eyes.
  The term steganography can date back to the 15th century, whose goal is to encode a secret message in some transport medium(called cover) and covertly communicate with a potential receiver who knows the decoding protocol. Essentially different from cryptography,steganography aims to hide the presence of secret communications, allowing only the target recipient to know. State differently, the covering medium can be publicly visible and yet only the target receiver can perceive the presence and decode the secret message. In practice, any steganography model should conceal a secret message by concurrently optimizing two criteria: minimizing the change of the cover in medium that leads to suspect from an adversary, and reducing the residual between decoded secret message and its ground truth. The research on steganography has practical implications. For example, an umber of nefarious applications of steganography techniques are known,such as hiding commands that coordinate criminal activities through images posted on social media websites.In the industry of digital publishing, a common tactic to claiming authorship without compromising the integrity of the digital content is to embed digital watermarks. For other brief introduction to steganography ,one can refer to the [blog](https://buzzrobot.com/hiding-images-using-ai-deep-steganography-b7726bd58b06) and this [github repo](https://github.com/muziyongshixin/pytorch-Deep-Steganography).

<img align="center" width="800" src="{{ site.url }}/images/ste/ste.jpg" alt="steganography pipline">
<!-- * [RFF Identification Overview]({{ site.url }}/posts/2019/04/blog-post-rffi_main/) -->
