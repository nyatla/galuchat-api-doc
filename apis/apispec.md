# /apispec

APIのスペック情報を格納したJSONを返します。JSONに含まれる情報は以下の通りです。

1. APIのバージョン情報
2. 提供するエンドポイントのリスト
3. 利用可能なマップセットのリスト


## Request

```
GET https://galuchat.nyatla.jp/apispec
```

#### link
https://galuchat.nyatla.jp/apispec

## Response
```
{
  "endpoints" : [ "rjcc", "rjccs", "raac", "raacs", "mapgen", "raw/readpixel", "raw/readrect", "apispec" ],
  "mapcodes" : [ {
    "area" : {
      "west" : 122.93,
      "east" : 153.99,
      "south" : 20.42,
      "north" : 45.56
    },
    "name" : "sc100",
    "description" : "Center single 0.01deg unit nogrid - V1",
    "metadata" : null,
    "type" : "garuchatwgsmap",
    "resolution" : {
      "lat" : 0.01,
      "lon" : 0.01
    }
  :
  :
  }, {
    "area" : {
      "west" : 122.9326,
      "east" : 153.9868,
      "south" : 20.4227,
      "north" : 45.5573
    },
    "name" : "ma10000",
    "description" : "Max area 0.1 0.0001deg unit withgrid- V2",
    "metadata" : "{\"wgsmap\": \"--block-size 512 --block-format all --block-compress lzss\", \"llcsv\": \"--unit 0.0001 --sampling MAX_AREA --minimum_rate .01\"}",
    "type" : "garuchatwgsmap",
    "resolution" : {
      "lat" : 1.0E-4,
      "lon" : 1.0E-4
    }
  } ],
  "version" : "garuchat-api/1;GaluchatJava/0.2.0"
}
```


### レスポンスJSONフォーマット

- endpoints - 利用可能なエンドポイントのリストです。
- mapsets - 利用可能なマップの情報のリストです。
  - area - マップが格納している経緯度の範囲です。
  - name - マップを識別する名称です。
  - description - マップを説明する文章です。
  - metadata - マップの構成を説明する自由テキストです。
  - type - 暫定値。使用しないでください。
  - resolution - マップのサンプリング単位です。
- version - APIのバージョンを示す文字列です。


### 補足説明

各エンドポイントは、mapestsの要素のnameにより、処理対象のマップを識別します。

area値は経緯度座標系におけるマップの格納範囲です。マップはX軸を緯度、Y軸を経度と並行に定義し、経緯度座標計の(west,north)を起点に矩形を定義します。

resolutionは、マップの経度、緯度方向の解像度を示します。単位以下の値は切り上げられ、同一値として扱われます。



