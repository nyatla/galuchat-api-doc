# GaluchatAPI


GatuchatAPIは、地図情報の参照APIを提供するシステムです。
以下の機能を提供します。

- 行政区域コードの逆ジオコーディング機能
- JARLコンテストコードの逆ジオコーディング機能
- 簡易的な行政区域地図の生成機能
- RawLevelAPI呼び出し機能

## 利用条件

- 本サービスの管理者は、利用者がAPIを用いて行う一切の行為について責任を負いません。本サービスは予告なく変更・削除されることがあります。
- ソフトウェアの動作確認を目的として、送信されたリクエストを記録しています。不要な情報を送信しないでください。
- 本サービスから取得した情報を中継または蓄積し、第三者に提供するWebサイトやその他のシステムについては、システムの利用者および設置者が本利用条件に同意した場合、またはシステムの設置者がすべての責任を負う場合のみ利用を許可します。
- 取得したデータのうち、座標およびコード情報は、[国土地理院コンテンツ利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html)に従う必要があります。他の情報についても出典を参考にし、適切に取り扱ってください。
- 継続的な業務用途での利用を検討されている場合は、事前に管理者へ相談することを推奨します。
- 機械的なスクレイピングは、API制限の範囲内で許可されていますが、サーバーに過度な負荷をかけないようにご配慮ください。APIリミットやその他の技術的な制限については、[現在のサーバー設定](./current_setting.md)をご覧ください。


# APIs
提供するAPIの仕様は以下の通りです。

## システムAPI
| エンドポイント|メソッド |機能|
| -------------|-| ------------- |
| [/apispec](./apis/apispec.md) |GET| APIの機能情報をJSONにして返します。 |


## 逆ジオコーディングAPI
経緯度から情報を得るAPIです。

| エンドポイント|メソッド |機能|
| -------------|-| ------------- |
| [/raac](./apis/racc.md)  |GET| 経緯度から行政区域コードと行政区名を返します。|
| [/rjcc](./apis/rjcc.md)  |GET| 経緯度からJARLコンテストコードと区域名を返します。|
| [/raacs](./apis/raacs.md) |POST| 経緯度リストから行政区域コードをと区域名のリストを返します。|
| [/rjccs](./apis/rjccs.md) |POST| 経緯度リストからJARLコンテストコードと区域名のリストを返します。|


## マップ画像生成API
領域からマップ画像を生成するAPIです。

| エンドポイント|メソッド |機能|
| -------------|-| ------------- |
| [/mapgen](./apis/mapgen.md) |GET| 経緯度を起点として、領域画像を生成します。|



## RawLevelAPI
RawlevelAPIは開発用です。アプリケーションは使用すべきではありません。

| エンドポイント|メソッド |機能|
| -------------|-| ------------- |
| /getpoint |GET| 座標に対応する値を返します。  |
| /getrect |GET| 起点及びサイズで定義される領域内にある座標の値を、PNG形式に格納して返します。 |


## API共通仕様

### 値型
- [URLパラメータの値型](./valuetype.md)

### レスポンスコード

- HTTPレベルでは、成功時はステータス200を返します。
- 失敗時は40x、または50xを返し、可能であればJSONによる詳細情報を返します。






# 出典

APIが生成する情報の元データは以下のものを使用しています。

1. 国土交通省国土数値情報ダウンロードサイト  
   国土交通省国土数値情報を加工・編集した地図情報を使用しています。  
   https://nlftp.mlit.go.jp/ksj/index.html
2. w-ockham/JCC-JCG-List     
   munitable.csvを加工・編集した地図情報を使用しています。  
   https://github.com/w-ockham/JCC-JCG-List/blob/master/LICENSE


# デモ
APIを利用したマップで地点を検索するSPAです。地図の生成から逆ジオコード迄を単独で提供します。

1. [行政区域コードマップ](https://nyatla.jp/galuchat-api-js/aac/)
2. [JARL市郡区コードマップ](https://nyatla.jp/galuchat-api-js/jcc/)

ソースは[lib](./lib/galuchat-api-js)にあります。


# その他資料

1. 行政区域コード  
   https://nlftp.mlit.go.jp/ksj/gml/codelist/AdminiBoundary_CD.xlsx
2. JARLコンテストコード  
   https://www.jarl.org/Japanese/A_Shiryo/A-2_jcc-jcg/jcc.htm





