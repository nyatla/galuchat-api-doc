# RESTAPI 仕様

Gatuchat-APIの公開するAPI仕様です。

Gatuchat-APIは、地図情報の参照APIを提供するシステムです。
以下の情報を提供します。

- RawAccessAPI
- 行政区域コード/名称の逆ジオコーディング機能
- 行政区域地図の生成機能
- JARLコンテストコード/名称の逆ジオコーディング機能


# 値型

## 数値

```
FLOAT  = [0-9]+(\.[0-9]+)?|\.[0-9]+
EFLOAT = <<FLOAT>>(E[+-]?[0-9]+)?
SFLOAT = [+-]?<<EFLOAT>>
```

## 経緯度値
```
LONVALUE = [NS]<<EFLOAT>>
LATVALUE = [EW]<<EFLOAT>>
```

数値の場合、正を北緯と東経、負を南緯と西経とします。
プレフィクス付きの場合、数値部は正数です。符号はNSEWにより決定します。




# API

## 一覧

### GET
- `getpoint`
ローレベルAPIです。座標に対応する値を返します。
- `getrect`
ローレベルAPIです。起点及びサイズで定義される領域内にある座標の値を、PNG形式に格納して返します。


- `/apispec`
APIの機能を返します。
- `/raac`
経緯度から行政区域コードと行政区名を返します。
- `/rjcc`
経緯度からJARLコンテストコードの情報を返します。
- `/mapgen`
経緯度を起点として、領域画像を生成します。

### POST
- `/rjccs`
経緯度のリストから行政区域コードと行政区名を一括で返します。
- `/raacs`
経緯度のリストからJARLコンテストコードの情報を一括で返します。


## レスポンスコード
HTTPレベルでは、成功時はステータス200を返します。
失敗時は40x、または50xを返し、可能であればJSONによる詳細情報を返します。



## 詳細

### /apispec
APIのスペックを返します。仕様は暫定形式であり、頻繁な変更があります。

#### Request

#### Response
```
{
	"version":"garuchat-api/1",
	"apis":[
		"/apispec",
		"/aacode",
	]
	"mapcodes":[
		{
			"name":"r100",
			"type":"wgs84;center-samping",
			"resolution":{
				"lon":0.01,"lat":0.01,
			},
			"area":{
				"north":
				"south":
				"east":
				"west":
			}
			"description":"",
			"metadata":{
			}
	],

}
```
### /raac
経緯度から行政区域コードと行政区名を返します。

#### REQUEST
```
 /raac?lon=[LONVALUE]&lat=[LATVALUE]&mapcode=[MAPCODE]
```

- lon
経度。経緯度表現の数値。LONVALUE
- lat
緯度。経緯度表現の数値。LATVALUE
- mapcode(optional)
使用するマップデータの種類

#### RESPONSE



### /rjcc
経緯度からJARLコンテストコードの情報を返します。

#### Request
```
 /rjcc?lon=[LONVALUE]&lat=[LATVALUE]&mapcode=[MAPCODE]
```

- lon
経度。経緯度表現の数値。LONVALUE
- lat
緯度。経緯度表現の数値。LATVALUE
- mapcode(optional)
使用するマップデータの種類

#### Response



### /mapgen (experimental)
経緯度(lon,lat)を起点として、領域画像を生成します。
生成する地図の投影法式はWGS84座標系のみです。

#### Request

```
/mapgen?...
```
- lon 基準位置の緯度
- lat 基準位置の経度
- base(optional) 矩形の基準位置。
	- ne 矩形の左上を基準点とする。
	- center 矩形の中央を基準点とする。
- width(optional) 矩形の幅。単位はunitによる。
- height(optional) 矩形の高さ。単位はunitによる。
- unit(optional) width,heightの矩形のサイズの単位を指定する。
  - deg 経緯度EFLOATで指定します。
  - px 整数のピクセル値で指定します。
- mapset(optional) 使用するマップデータの種類
- aac(optional) 識別色を指定する行政区コードのカンマリスト
- jcc(optional) 識別色を指定するJARLコンテストコードのカンマリスト


jcc,aac,lc,sc,ec,bc,

base,width,height,unitを省略した場合、それぞれ以下のデフォルト値を使用します。
```
base=center
width=320
height=240
unit=px
```

#### Response
 
### /raacs
複数の座標を一括して逆ジオコーディング処理します。
経緯度リストを行政区リストへ変換します。

#### Request
```
POST /raacs
{
	unit:EFLOAT,
	points:[
		[LONVALUE,LATVALUE],
		...
	]
}
```
- unit pointsの各要素にかかる係数です。省略時は1です。(経度緯度をそのまま使用)
- points 経度、緯度をセットにした配列の配列です。

#### Response
入力したpointsリストと同じ数の行政区コード番号リストと、行政区番号の辞書を返します。
変換できないpoints項目はnullになります。

### /rjccs
複数の座標を一括して逆ジオコーディング処理します。
経緯度リストをJARLコンテストコードへ変換します。





マップは、1ピクセルをresolution.lon x resolution.latの矩形の集合で構成したビットマップです。
ビットマップの各ピクセルは、経緯度座標系をresolution.lat/resolution.lon単位で区切った線分の交点を中心とします。

ビットマップのサイズは、以下の計算式で算出します。
- 横=(area.east-area.west)/resolution.lon
- 縦=(area.north-area-south)/resolution.lat

各ピクセルの値は、ピクセルが占有する領域の代表値です。


