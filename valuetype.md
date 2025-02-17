# 値型


## クエリパラメータ
クエリパラメータに指定する値の書式です。

### 数値

|型名|定義|説明|例|
|-----|-----|-----|-|
|UINT|[1-9]?[0-9]*|符号なしの整数|0 , 1 , 2|
|INT|[+-]?\<\<UINT\>\>|符号付の整数|0 , +1 , -2|
|FLOAT|[0-9]+(\.[0-9]+)?\|\.[0-9]+|符号なしの浮動小数点数|1 , 1.0 , 1.23|
|EFLOAT|\<\<FLOAT\>\>(E[+-]?[0-9]+)?|指数表現を含む浮動小数点数|1 , 1.2 , 1e-10 , 1.2e+10|
|SFLOAT|[+-]?\<\<EFLOAT\>\>|符号付きの浮動小数点数|+1.2 , -1.3 , 12.3e+4|
|TEXT|.*|0文字以上の文字列(ASCII又はutf8)| A , abc123 ,  |



## 経緯度値

|型名|定義|説明|例|
|-|-|-----|-|
|LONVALUE|[NS]?\<\<EFLOAT\>\>|緯度値の浮動小数点数。<br/>Sを指定した場合符号が反転する。省略時はN。| 12.4 , S23.4 , N12.3|
|LATVALUE|[EW]?\<\<EFLOAT\>\>|経度値の浮動小数点数。<br/>Wを指定した場合符号が反転する。省略時はE。| 12.4 , W23.4 , E12.3|

- [NS]と[EW]は省略可能。
- 数値の場合、符号は使用不能。正を北緯と東経、負を南緯と西経とする。


## 特殊型
|型名|定義|説明|例|
|-----|-----|-----|-|
|AAC|[0-9]{1,6}|行政区コード|01001 , 11000 , 2002|
|JCC|([0-9]{5}(\\.?{A-Z})?)\|[0-9]{6}|JARL市郡区番号<br>https://www.jarl.org/Japanese/A_Shiryo/A-2_jcc-jcg/jcc.htm | 1216 , 110303 , 11007.A|
|COLOR|\<\<HEX\>\>\|\<\<RGB\>\>\|\<\<TEXT\>\>|カラーコード値<br/>**HEX:** (?:0x\|#)?([0-9a-fA-F]{6}<br>**RGB:** rgb(\<\<UINT\>\>,\<\<UINT\>\>,\<\<UINT\>\><br>**TEXT:** (red \| green \| blue \| black \| white \| yellow \| cyan \| magenta \| gray \| darkgray \| lightgray \| purple \| orange)|rgb(0,0,255) , red , #007777|
|MAPSET|\<\<TEXT\>\>|利用な値は、[現在のサーバー設定](./current_mapset_list.md)を参照してください。基本的には[/apispec](./apis/apispec.md)のmapsetsリストの要素のname値から選択します。| - |
