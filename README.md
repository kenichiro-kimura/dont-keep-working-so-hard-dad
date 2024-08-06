# パパ、ちゃんと休んでね - Don't keep working so hard, Dad - 

## 概要

2024/7/17に開催された、SORACOM Discovery 2024での企画「Call for IoTプロトタイピングby SORACOM UG」に提出した作品です。

## プロジェクト概要

IoTデバイスを使って、父親の作業状況を監視し、適切なタイミングで休憩を促すシステムです。  
デバイスの情報だけでなく、父親のスケジュールを考慮して、休憩を促します。

## プロジェクト構成

- `device`: デバイス側のプログラム(M5Stack + [Grove Ultrasonic Ranger](https://wiki.seeedstudio.com/Grove-Ultrasonic_Ranger/))
- `functions`: クラウド側のプログラム(Azure Functions/Node.js)
- `lambda`: クラウド側のプログラム(AWS Lambda/Node.js)。デプロイには[serverless framework](https://www.serverless.com/)を利用。
- `common-lib`: `funcitons`と`lambda`で利用する共通ライブラリ
- `documents`: ドキュメント
- `web`: デモのためにスケジュールを表示するWebページ。表示には[jquery-skeduler](https://github.com/decease/jquery-skeduler)を利用

## タイトル元ネタ

[Don't Be Shy, Zenigata](https://www.youtube.com/watch?v=5sJQIFRTuA8)
