# パパ、ちゃんと休んでね - Don't keep working so hard, Dad - 

## 概要

2024/7/17に開催される、SORACOM Discovery 2024での企画「Call for IoTプロトタイピングby SORACOM UG」に提出する作品です。

## プロジェクト概要

IoTデバイスを使って、リモートで父親の作業状況を監視し、適切なタイミングで休憩を促すシステムです。  
デバイスの情報だけでなく、父親のスケジュールを考慮して、休憩を促します。

## プロジェクト構成

- `device`: デバイス側のプログラム(M5Stack + [Grove Ultrasonic Ranger](https://wiki.seeedstudio.com/Grove-Ultrasonic_Ranger/))
- `functions`: クラウド側のプログラム(Azure Functions/Node.js)
- `iac`: インフラ構築のためのコード(Bicep)

## タイトル元ネタ

[Don't Be Shy, Zenigata](https://www.youtube.com/watch?v=5sJQIFRTuA8)