# /racc

経度と緯度から、その地点のestat小区域コードと地名情報を返します。

このAPIは通信オーバーヘッドが大きいので、複数の点を処理する場合は、[/resareas](./resareas.md)を利用してください。

## Request

```
GET https://galuchat.nyatla.jp/resarea?lat=35.7437485&lon=140.0269324
```

#### link
https://galuchat.nyatla.jp/resarea?lat=35.7437485&lon=140.0269324

### URLパラメータ

|値名|M/O|[値型](../valuetype.md)|説明|
|--|--|--|--|
|lat|M|LATVALUE|緯度を指定します。|
|lat|M|LATVALUE|経度を指定します。|
|mapset|O|TEXT|使用するマップセットの名前を指定します。省略時はデフォルト値を使います。ESCODEタイプのマップの未使用可能です。<br/>値の詳細は、[現在のサーバー設定](../current_setting.md) を参照してください。|



## Response
```
{
  "sarea" : {
    "prefecture" : "千葉県",
    "city" : "船橋市",
    "s_area" : "二和東二丁目"
  },
  "scode" : 1404052002
}
```



### レスポンスJSONフォーマット

- scode - Estat小区域コードです。[町丁・字等境界データ データベース定義書](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521)のPREF+CITY+S_AREAを結合した最大11桁の値です。
- sarea - 都道府県名、市町村名、小区域名を返します。小区域名(s_code)はnullの場合があります。
  
### 補足説明

返却値はマップセットの解像度により異なります。
より精密な測定には解像度が高いマップを使ってください。




