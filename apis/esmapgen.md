# /esmapgen

経度と緯度を中心に矩形を定義し、estat小区域コードマップから地図画像を生成します。

**注意**
この機能が生成する地図は投影を考慮していません。WGS84座標系をそのまま平面にしているため、一般的な投影地図とは表示が異なります。



## Request

```
GET https://galuchat.nyatla.jp/esmapgen?lat=35.68&lon=139.75&size=640,480&scode=1401014000
```
#### link
https://galuchat.nyatla.jp/esmapgen?lat=35.68&lon=139.75&size=640,480&sarea=1401014000


### URLパラメータ
|値名|M/O|[値型](../valuetype.md)|説明|
|--|--|--|--|
|lat|M|LATVALUE|緯度を指定します。|
|lon|M|LATVALUE|経度を指定します。|
|base|O|TEXT|基準点の位置を指定します。<br>center , notrhwest , southwest , northeast , southeastのうち何れか１つを指定します。<br>省略時はcenterです。|
|size|O|int,int|カンマ区切りで画像のサイズを指定します。省略時は320,240です。|
|sc|O|COLOR|選択領域（陸上）の色を指定します。|
|dc|O|COLOR|非選択領域（陸上）の色を指定します。|
|ec|O|COLOR|境界線の色を指定します。|
|zc|O|COLOR|無効領域（海上水域）の色を指定します。|
|noedge|O|-|境界線の描画を無効にします。|
|scode|O|SCODE,SCODE|estat小区域コードで領域を選択します。|
|mapset|O|TEXT|使用する市区町村コードマップセットの名前を指定します。省略時はデフォルト値を使います。<br/>使用できる値は、[現在のサーバー設定](../current_setting.md) を参照してください。|



## Response
PNG画像です。

<img src="https://galuchat.nyatla.jp/esmapgen?lat=35.68&lon=139.75&size=640,480&scode=13101014000">


### 補足説明

画像の解像度、形状は、マップセットの選択値により異なります。



