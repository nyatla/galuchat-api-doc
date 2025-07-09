# /racc

経度と緯度から、その地点の行政区域コードと地名情報を返します。

このAPIは通信オーバーヘッドが大きいので、複数の点を処理する場合は、[/raacs](./raacs.md)を利用してください。

## Request

```
GET https://galuchat.nyatla.jp/raac?lat=35.7437485&lon=140.0269324
```

#### link
https://galuchat.nyatla.jp/raac?lat=35.7437485&lon=140.0269324

### URLパラメータ

|値名|M/O|[値型](../valuetype.md)|説明|
|--|--|--|--|
|lat|M|LATVALUE|緯度を指定します。|
|lat|M|LATVALUE|経度を指定します。|
|mapset|O|TEXT|使用するマップセットの名前を指定します。省略時はデフォルト値を使います。<br/>値の詳細は、[現在のサーバー設定](../current_setting.md) を参照してください。|



## Response
```
{
  "address" : {
    "city" : "船橋市",
    "prefecture" : "千葉県"
  },
  "aacode" : 12204
}
```



### レスポンスJSONフォーマット

- aacode - 行政区域コードを返します。
- address - 都道府県名、市町村名を返します。

### 補足説明

返却値はマップセットの解像度により異なります。
より精密な測定には解像度が高いマップを使ってください。



