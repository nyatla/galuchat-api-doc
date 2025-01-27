# /rjcc

経度と緯度から、その地点のJARLコンテストコードと地名情報を返します。

このAPIは通信オーバーヘッドが大きいので、複数の点を処理する場合は、[/rjccs](./rjccs.md)を利用してください。


## Request

```
GET https://galuchat.nyatla.jp/rjcc?lat=35.3742774&lon=140.360
```
#### link
https://galuchat.nyatla.jp/rjcc?lat=35.3742774&lon=140.360

### URLパラメータ

|値名|M/O|[値型](../valuetype.md)|説明|
|--|--|--|--|
|lat|M|LATVALUE|緯度を指定します。|
|lat|M|LATVALUE|経度を指定します。|
|mapset|O|TEXT|使用するマップセットの名前を指定します。省略時はデフォルト値を使います。<br/>値の詳細は、[現在のサーバー設定](../current_setting.md) を参照してください。|


## Response
```
{
  "aacode" : 12421,
  "jcc" : {
    "name" : "千葉県 長生郡 一宮町",
    "code" : "12011.A",
    "name_en" : "Chosei"
  }
}
```



### レスポンスJSONフォーマット

- aacode 行政区域コードを返します。
- jcc jcc/jcgの区域名、コンテストコード、英名を返します。

### 補足説明

返却値はマップセットの解像度により異なります。
より精密な測定には解像度が高いマップを使ってください。



