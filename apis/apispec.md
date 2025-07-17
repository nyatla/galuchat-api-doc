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
  "version" : "galuchat-webapi/3;GaluchatJava/0.3.0",
  "mapsets" : [ {
    "area" : {
      "west" : 122.93,
      "east" : 153.99,
      "south" : 20.42,
      "north" : 45.56
    },
    "name" : "sc100",
    "description" : "Center single 0.01deg unit nogrid - V1",
    "metadata" : null,
    "type" : "WgsMapset;AACODE",
    "resolution" : {
      "lat" : 0.01,
      "lon" : 0.01
    }
  }, {
    "area" : {
      "west" : 122.932,
      "east" : 153.987,
      "south" : 20.422,
      "north" : 45.558
    },
    "name" : "sc1000",
    "description" : "Center single 0.001deg unit nogrid - V1",
    "metadata" : null,
    "type" : "WgsMapset;AACODE",
    "resolution" : {
      "lat" : 0.001,
      "lon" : 0.001
    }
  }, {
    "area" : {
      "west" : 122.93,
      "east" : 154.0,
      "south" : 20.42,
      "north" : 45.57
    },
    "name" : "ma100",
    "description" : "Max area 0.1 0.01deg unit withgrid- V2",
    "metadata" : "{\"wgsmap\": \"--block-size 512 --block-format all --block-compress lzss\", \"llcsv\": \"--unit 0.01 --sampling MAX_AREA --minimum_rate .01\"}",
    "type" : "WgsMapset;AACODE",
    "resolution" : {
      "lat" : 0.01,
      "lon" : 0.01
    }
  }, {
    "area" : {
      "west" : 122.933,
      "east" : 153.988,
      "south" : 20.423,
      "north" : 45.558
    },
    "name" : "ma1000",
    "description" : "Max area 0.1 0.001deg unit withgrid- V2",
    "metadata" : "{\"wgsmap\": \"--block-size 512 --block-format all --block-compress lzss\", \"llcsv\": \"--unit 0.001 --sampling MAX_AREA --minimum_rate .01\"}",
    "type" : "WgsMapset;AACODE",
    "resolution" : {
      "lat" : 0.001,
      "lon" : 0.001
    }
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
    "type" : "WgsMapset;AACODE",
    "resolution" : {
      "lat" : 1.0E-4,
      "lon" : 1.0E-4
    }
  }, {
    "area" : {
      "west" : 122.9338,
      "east" : 153.9829,
      "south" : 20.425,
      "north" : 45.5231
    },
    "name" : "estatremap10000",
    "description" : "Max area 0.1 0.0001deg unit withgrid estat_remap - V2 ",
    "metadata" : "{\"llcsv\": \"--unit 0.0001 --sampling MAX_AREA --minimum_rate .01\"}",
    "type" : "WgsMapset;ESCODE",
    "resolution" : {
      "lat" : 1.0E-4,
      "lon" : 1.0E-4
    }
  } ],
  "endpoints" : [ "rjcc", "rjccs", "raac", "raacs", "resarea", "resareas", "mapgen", "apispec" ]
}
```


### レスポンスJSONフォーマット

- endpoints - 利用可能なエンドポイントのリストです。
- mapsets - 利用可能な市区町村コードマップの情報のリストです。
  - area - マップが格納している経緯度の範囲です。
  - name - マップを識別する名称です。
  - description - マップを説明する文章です。
  - metadata - マップの構成を説明する自由テキストです。
  - type - マップ値の種類を示します。AACODEは行政区域コードの即値、ESCODEは小区域コードのインデクスです。この値は暫定です。
  - resolution - マップのサンプリング単位です。
- estatmapset - 利用可能なestat小区域コードマップの情報リストです。
　- 各パラメータの意味はmapsetと同じです。 
- version - APIのバージョンを示す文字列です。


### 補足説明

各エンドポイントは、mapestsの要素のnameにより、処理対象のマップを識別します。

area値は経緯度座標系におけるマップの格納範囲です。マップはX軸を緯度、Y軸を経度と並行に定義し、経緯度座標計の(west,north)を起点に矩形を定義します。

resolutionは、マップの経度、緯度方向の解像度を示します。単位以下の値は切り上げられ、同一値として扱います。



