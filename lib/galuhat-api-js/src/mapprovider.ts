import {Point,Lonlat,  UnitInvs} from "./galuchat-typse"
import {DEFALUT_ENDPOINT,MAPSET_TABLE} from "./appdef"


export class MapOptions{
    constructor(readonly aacs:number[]){}
    public get querySuffix(){
        return `&aac=${this.aacs.join(',')}`
    }
}
export interface IMapProvider{
    /**
     * MAP
     * @param {*} lon 
     * @param {*} lat 
     * @param {*} width 
     * @param {*} height 
     * @return {ImageBitmap}
     */
    getMap(lon:number,lat:number,width:number,height:number,options:MapOptions|undefined):Promise<GaluchatMap>;
    /**
     * マップセットの名前を返す
     */
    readonly mapset:string;
}

export class GaluchatMap {
    public readonly center: Lonlat;
    public readonly unitinvs: UnitInvs;
    public readonly bitmap: ImageBitmap;

    /**
     * コンストラクタで初期化する。
     * 初期化後、これらのプロパティは変更できません。
     * 
     * @param center_lon - 地図の中心点の経度
     * @param center_lat - 地図の中心点の緯度
     * @param unitinv - 解像度逆数
     * @param bitmap - 地図の画像データ
     */
    constructor(center_lon: number, center_lat: number, unitinvs:UnitInvs,bitmap: ImageBitmap) {
        this.center=new Lonlat(center_lon,center_lat);
        this.unitinvs=unitinvs;
        this.bitmap = bitmap;
    }

    /**
     * 画像の幅
     */
    get width(): number {
        return this.bitmap.width;
    }

    /**
     * 画像の高さ
     */
    get height(): number {
        return this.bitmap.height;
    }
    /**
     * 画像の左下ピクセルが所属する経緯度
     */
    get leftBottomLatLon():Lonlat{
        const uinv=this.unitinvs
        return new Lonlat(
            (this.center.lon-this.width*uinv.x/2),
            (this.center.lat-this.height*uinv.y/2)
        );
    }
    /**
     * 画像の座標を経緯度に変換
     */
    point2Lonlat(x:number,y:number):Lonlat{
        const uinv=this.unitinvs
        const left_lon=Math.round(this.center.lon*uinv.x-this.width/2)
        const bottom_lat=Math.round(this.center.lat*uinv.y-this.height/2)



        // return new Lonlat(lbll.lon,lbll.lat);
        return new Lonlat(
            (x+left_lon)/uinv.x,
            (this.bitmap.height-1-y+bottom_lat)/uinv.y
        );
    }
    /**
     * 経緯度を画像の座標系に変換。範囲外の数値になることもあるよ。
     */
    Lonlat2Point(lon:number,lat:number):Point{
        const lbll=this.leftBottomLatLon;
        const unitinv=this.unitinvs
        return new Point(Math.round((lon-lbll.lon)*unitinv.x),this.height-1-Math.round((lat-lbll.lat)*unitinv.y))
    }
    /**
     * イミュータブルなデータクラスのインスタンスを変えることなく
     * 新しいインスタンスを返すメソッドの例。
     * 
     * @param newBitmap - 新しいImageBitmap
     * @returns 新しいGaluchatGenMapResultインスタンス
     */
    withNewBitmap(newBitmap: ImageBitmap): GaluchatMap {
        return new GaluchatMap(this.center.lon, this.center.lat, this.unitinvs,newBitmap);
    }
    public renderToCanvas(ctx:CanvasRenderingContext2D,x:number=0,y:number=0) {
        ctx.drawImage(this.bitmap, x, y);
    }    
    
}




/**
 * GaluchatWebAPIから画像をフェッチする
 */
export class WebApiMapProvider implements IMapProvider
{
    private readonly endpoint:string;

        
    public readonly mapset:string
    private readonly unit_invs:UnitInvs
    constructor(mapset_name:string,endpoint:string=DEFALUT_ENDPOINT){
        if((mapset_name in MAPSET_TABLE)==false){
            throw new Error(`Invalid mapset name:${mapset_name}`);
        }
        this.endpoint=`${endpoint}/mapgen`;
        this.mapset=mapset_name;
        this.unit_invs=MAPSET_TABLE[mapset_name];
    }
    /**
     * 指定した経度・緯度に基づいて、画像データを取得するメソッド
     * 
     * @param lon - 経度
     * @param lat - 緯度
     * @param width - 画像の幅
     * @param height - 画像の高さ
     * @returns ImageBitmap - 取得したPNG画像
     */
    async getMap(lon: number, lat: number, width: number, height: number,options:MapOptions|undefined=undefined): Promise<GaluchatMap> {
        // APIエンドポイントへのURLを構築
        const url = `${this.endpoint}?lon=${lon}&lat=${lat}&size=${width},${height}&mapset=${this.mapset}${options?options.querySuffix:""}`;
        console.log(url);

        // GETリクエストを送信して画像データを取得
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch map image: ${response.statusText}`);
        }

        // 画像データをArrayBufferとして取得し、それをImageBitmapとして変換
        const arrayBuffer = await response.arrayBuffer();
        const imageBitmap = await createImageBitmap(new Blob([arrayBuffer]));

        return new GaluchatMap(lon,lat,this.unit_invs,imageBitmap);
    }
}