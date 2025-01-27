# /rjccs

複数の経度と緯度について、その地点のJARLコンテストコードと地名情報を返します。


## Request

```
POST https://galuchat.nyatla.jp/rjccs
```

#### curl
```
$curl -X POST https://galuchat.nyatla.jp/rjccs -H "Content-Type: application/json" -d '{"unit":0.01,"points":[[14036,3537],[14002,3574]]}'
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
    "12421" : {
      "name" : "千葉県 長生郡 一宮町",
      "code" : "12011.A",
      "name_en" : "Chosei"
    },
    "12204" : {
      "name" : "千葉県 船橋市",
      "code" : "1204",
      "name_en" : "Funabashi"
    }
  },
  "aacodes" : [ 12421, 12204 ]
}
```

### レスポンスJSONフォーマット

- address - 結果に含まれる行政区域コードの情報セットです。
- aacodes - リクエストのpointsごとのJARLコンテストコードのリストです。

### 補足

addressには、有効なaacodesの値が全て含まれています。  
aacodesは行政区域コードのリストです。pointsに設定した順に格納されています。該当する行政区域コードが見つからなかった場合は、その項目はnullになります。  

結果を行政区域コードのリストに変換するには、aacodesをキーにadderssesを取得してください。

#### Javascript
```
//responseにjsonが格納されているとして
const result = response.aacodes.map(code => (
  response.addresses[code] || null
));

console.log(result);
/*
出力:
[
  {name : "千葉県 長生郡 一宮町",code : "12011.A",name_en : "Chosei" },
  {name : "千葉県 船橋市",code : "1204",name_en : "Funabashi" }
]
*/
```
#### Python

```
# responseにjsonが格納されているとして
result = [
    response["addresses"].get(str(code), None)
    for code in response["aacodes"]
]

print(result)
"""
出力:
[
  {'name' : '千葉県 長生郡 一宮町','code' : '12011.A','name_en' : 'Chosei' },
  {'name' : '千葉県 船橋市','code' : '1204','name_en' : 'Funabashi' }
]
"""
```