import {Point,Lonlat,  UnitInvs,GsiBox} from "./galuchat-typse"
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
    /**
     * マップの解像度情報
     */
    readonly unit_invs:UnitInvs

}

export class GaluchatMap {
    /**
     * 中心位置
     */
    public readonly center: Lonlat;
    /**
     * ドットピッチの逆数。1/unitinv
     */
    public readonly unitinvs: UnitInvs;
    /**
     * ビットマップオブジェクト
     */
    public readonly bitmap: ImageBitmap;
    public readonly mapoptions: MapOptions|undefined;

    /**
     * コンストラクタで初期化する。
     * 初期化後、これらのプロパティは変更できません。
     * 
     * @param center_lon - 地図の中心点の経度
     * @param center_lat - 地図の中心点の緯度
     * @param unitinv - 解像度逆数
     * @param bitmap - 地図の画像データ
     */
    constructor(center_lon: number, center_lat: number, unitinvs:UnitInvs,mapoprions:MapOptions|undefined,bitmap: ImageBitmap) {
        this.center=new Lonlat(center_lon,center_lat);
        this.unitinvs=unitinvs;
        this.bitmap = bitmap;
        this.mapoptions=mapoprions
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
     * 経緯度マップでの矩形
     */
    get llbox():GsiBox{
        const uinv=this.unitinvs
        const clon=this.center.lon
        const clat=this.center.lat
        const hw=this.width*uinv.x/2
        const hh=this.height*uinv.x/2
        return new GsiBox(clat+hh,clat-hh,clon-hw,clon+hw)
    }
    /**
     * 画像の座標を経緯度に変換する。
     * ピクセル中心がunit経緯度であることに注意
     */
    point2Lonlat(x:number,y:number):Lonlat{
        const uinv=this.unitinvs
        const left_lon=Math.round(this.center.lon*uinv.x-this.width/2)
        const bottom_lat=Math.round(this.center.lat*uinv.y-this.height/2)
        return new Lonlat(
            (x+0.5+left_lon)/uinv.x,
            (this.bitmap.height-1-y+0.5+bottom_lat)/uinv.y
        );
    }
    /**
     * 経緯度を画像の座標系に変換。範囲外の数値になることもあるよ。
     */
    lonlat2Point(lon:number,lat:number):Point{
        const lbll=this.llbox;
        const unitinv=this.unitinvs
        return new Point(Math.round((lon-lbll.south)*unitinv.x),this.height-1-Math.round((lat-lbll.west)*unitinv.y))
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
    public readonly unit_invs:UnitInvs
    constructor(mapset_name:string,endpoint:string=DEFALUT_ENDPOINT){
        if((mapset_name in MAPSET_TABLE)==false){
            throw new Error(`Invalid mapset name:${mapset_name}`);
        }
        this.endpoint=`${endpoint}/mapgen`;
        this.mapset=mapset_name;
        this.unit_invs=MAPSET_TABLE[mapset_name];
    }
    #last_requested_url:string|undefined
    #last_map:GaluchatMap|undefined
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
        if(this.#last_requested_url==url && this.#last_map!=undefined){
            console.log(`cached return:${url}`);//二重描画がでてるときにあるかもね
            return this.#last_map
        }
        this.#last_requested_url=url
        console.log(`get:${url}`);

        // GETリクエストを送信して画像データを取得
        const response = await fetch(url);

        if (!response.ok) {
            this.#last_map=undefined
            throw new Error(`Failed to fetch map image: ${response.statusText}`);
        }

        // 画像データをArrayBufferとして取得し、それをImageBitmapとして変換
        const arrayBuffer = await response.arrayBuffer();
        const imageBitmap = await createImageBitmap(new Blob([arrayBuffer]));
        this.#last_map=new GaluchatMap(lon,lat,this.unit_invs,options,imageBitmap);

        return this.#last_map
    }
}