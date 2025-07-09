# /rjccs

複数の経度と緯度について、その地点のestat小区域コードと地名情報を返します。


## Request

```
POST https://galuchat.nyatla.jp/resareas
```

#### curl
```
$curl -X POST https://galuchat.nyatla.jp/resareas -H "Content-Type: application/json" -d '{"unit":0.01,"points":[[14036,3537],[14002,3574]]}'
```
### URLパラメータ

|値名|M/O|[値型](../valuetype.md)|説明|
|--|--|--|--|
|mapset|O|TEXT|使用するマップセットの名前を指定します。省略時はデフォルト値を使います。<br/>値の詳細は、[現在のサーバー設定](../current_setting.md) を参照してください。|



### リクエストJSONフォーマット
```
{
  "unit":0.01,
  "points":[
    [14036,3537],
    :
    [14002,3574]
  ]
}
```

- unit pointに乗算する係数です。
- points \[経度,緯度\]のリストです。必ずセットで指定します。

実際に処理される地点の値は、pointsの各値はunit倍です。例の場合、１個めの値は0.01倍され、次の値と同じになります。
```
14036\*0.01=140.36 , 3537\**0.01=35.37
```
経緯度をそのまま指定する時は、unitに1を指定します。


## Response
```
{
  "addresses" : {
    "1621001000" : {
      "prefecture" : "千葉県",
      "city" : "一宮町",
      "s_area" : "一宮"
    },
    "1404051006" : {
      "prefecture" : "千葉県",
      "city" : "船橋市",
      "s_area" : "金杉六丁目"
    }
  },
  "scodes" : [ 1621001000, 1404051006 ]
}
```

### レスポンスJSONフォーマット

- address - 結果に含まれる小区域コードの情報セットです。
- scodes - リクエストのpointsごとの都道府県名、市町村名、小区域名を返します。

### 補足

addressには、有効なscodesの値が全て含まれています。  scodesはestat小区域コードのリストです。pointsに設定した順に格納されています。該当する行政区域コードが見つからなかった場合は、その項目はnullになります。  

結果を行政区域コードのリストに変換するには、scodesをキーにadderssesを取得してください。

#### Javascript
```
//responseにjsonが格納されているとして
const result = response.aacodes.map(code => ({
  scodes: code,
  address: response.addresses[code] || null
}));

console.log(result);
/*
出力:
[
  { scodes: 1621001000, address: { city: '一宮町', prefecture: '千葉県',s_area: '一宮' } },
  { scodes: 1404051006, address: { city: '船橋市', prefecture: '千葉県',s_area: '金杉六丁目' } }
]
*/
```
#### Python

```
# responseにjsonが格納されているとして
result = [
    {
        "scodes": code,
        "address": response["addresses"].get(str(code), None)
    }
    for code in response["scodes"]
]

print(result)
"""
出力:
[
    {'scodes': 1621001000, 'address': {'city': '一宮町', 'prefecture': '千葉県',s_area: '一宮'}},
    {'scodes': 1404051006, 'address': {'city': '船橋市', 'prefecture': '千葉県',s_area: '金杉六丁目'}}
]
"""
```