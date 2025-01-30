
import {Lonlat,Point, UnitInvs} from "./galuchat-typse"
import {IMapProvider,GaluchatMap, MapOptions} from "./mapprovider"
import {GaluchatAac,WebApiAacProvider} from "./geocodeprovider"
import {DEFALUT_ENDPOINT,MAPSET_TABLE} from "./appdef"






export class MapMouseEvent extends MouseEvent {
    public readonly lonlat:Lonlat;//選択位置の経緯度
    constructor(event: Event, target:HTMLElement,mapinfo: GaluchatMap) {
        super(event.type, event);
        const e=event as MouseEvent
        const rect = target.getBoundingClientRect();
        this.lonlat=mapinfo.point2Lonlat(e.clientX! - rect.left,e.clientY! - rect.top);
    }
}


/**
 * クリック時の移動機能を備えたシンプルなマップコンポーネント
 * いくつかのイベントについてMapMouseEventイベントを返す。
 * @event click
 * @event mousemove
 * @event mouseup
 * @event mousedown
 * @event dblclick
 */
export class SimpleMapComponent extends EventTarget {
    protected element: HTMLElement;
    protected mapProvider: IMapProvider;
    private resizeObserver: ResizeObserver;
    protected last_options:MapOptions|undefined=undefined;
    protected canvas: HTMLCanvasElement;
    protected _clickHandler: EventListener;
    protected current_result:GaluchatMap|undefined;

    constructor(element: HTMLElement, mapProvider: IMapProvider)
    {
        super();
        //要素の構築
        const c=document.createElement("canvas");
        c.width = element.clientWidth;
        c.height = element.clientHeight;
        this.canvas=c   
        element.appendChild(c);
        //イベントバインド      
        this._clickHandler = this.handleClick.bind(this);

        // イベント監視のセットアップ
        element.addEventListener("click",this._clickHandler);
        element.addEventListener("mousemove",this._clickHandler);
        element.addEventListener("mousedown",this._clickHandler);
        element.addEventListener("mouseup",this._clickHandler);
        element.addEventListener("dblclick",this._clickHandler);

        // リサイズ監視のセットアップ
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const resizeEvent = new CustomEvent("resize", {
                    detail: { width: entry.contentRect.width, height: entry.contentRect.height }
                });
                this.dispatchEvent(resizeEvent);
            }
        });
        //リソースの初期化
        this.element = element;
        this.mapProvider = mapProvider;
        this.current_result=undefined;
    }
    public async update(lon:number,lat:number,options:undefined|MapOptions=undefined){
        const width = this.element.clientWidth;
        const height = this.element.clientHeight;
        try {
            const mapImage = await this.mapProvider.getMap(lon, lat, width, height,options?options:undefined);
            mapImage.renderToCanvas(this.canvas.getContext("2d")!);
            this.last_options=options
            this.current_result=mapImage            
        } catch (error) {
            this.current_result=undefined;
            console.error("Failed to update map:", error);
        }
    }
    /**
     * マッププロバイダを更新する。更新と同時にアップデートを実行。失敗した場合はproviderを元に戻す。
     * @param provider 
     * @returns 
     */
    public async switchMapProvider(provider:IMapProvider){
        const old=this.mapProvider
        try{
            this.mapProvider=provider        
            const cr=this.current_result
            if(cr==undefined){
                return;
            }
            this.update(cr!.center.lon,cr!.center.lat,this.last_options)
        }catch{
            this.mapProvider=old
            console.error("can not switch map provider")
        }
    }

    protected handleClick(event: Event) {
        if(!this.current_result){
            return;
        }
        this.dispatchEvent(new MapMouseEvent(event,this.element,this.current_result));
    }
    /**
     * クリーンアップ処理
     */
    public dispose() {
        this.element.removeEventListener("click", this._clickHandler);
        this.resizeObserver.disconnect();
    }
}



/**
 * ズームイン/ズームアウト/ドラッグで移動のできるマップ。
 * 解像度変更はマップ切替
 */
export class ZoomInMapComponent extends SimpleMapComponent {
    private map_providers: IMapProvider[];   //
    private current_map_rovider:number;     //現在選択しているマッププロバイダ
    private _wheelHandler: EventListener;
    /**
     * 
     * @param element 
     * @param mapProviders 
     * マッププロバイダの配列。低解像度→高解像度で指定してね。
     * @param default_map_index 
     * 現在選択しているマッププロバイダ
     */

    constructor(element: HTMLElement, mapProviders: IMapProvider[],default_map_index:number=0)
    {
        super(element,mapProviders[default_map_index]);
        this.map_providers=mapProviders
        this.current_map_rovider=default_map_index
        //イベントバインド      
        this._wheelHandler = this.handleWheel.bind(this);
        element.addEventListener("wheel",this._wheelHandler);
    }
    public async zoomIn():Promise<boolean>
    {
        if(this.current_map_rovider==0){
            return false
        }
        this.current_map_rovider-=1
        await this.switchMapProvider(this.map_providers[this.current_map_rovider])
        return true
    }
    public async zoomOut(){
        if(this.current_map_rovider>=this.map_providers.length-1){
            return false
        }
        this.current_map_rovider+=1
        await this.switchMapProvider(this.map_providers[this.current_map_rovider])
        return true
    }
    private handleWheel(event: Event) {
        const e= event as WheelEvent;
        if(this.mouse_dlg_start){
           return; //マウスのドラッグ操作中は何もしない
        }
        if (e.deltaY > 0) {
            this.zoomIn()
        } else {
            this.zoomOut()
        }
    }

    private mouse_dlg_start:Point|undefined=undefined //ドラッグの開始点
    private mouse_dlg_unitinv:UnitInvs|undefined=undefined //ドラッグの開始点
    
    protected override handleClick(event: Event) {
        let cr=this.current_result
        if(cr && event instanceof MouseEvent){
            switch(event.type){
                // case "dblclick":
                //     const rect = this.element.getBoundingClientRect();
                //     const lonlat=cr.point2Lonlat(event.clientX! - rect.left,event.clientY! - rect.top);
                //     this.update(lonlat.lon,lonlat.lat)
                //     break;
                // case "dblclick":
                //     const rect = this.element.getBoundingClientRect();
                //     const lonlat=cr.point2Lonlat(event.clientX! - rect.left,event.clientY! - rect.top);
                //     this.update(lonlat.lon,lonlat.lat)
                //     break;
                case "mouseup":
                    if(this.mouse_dlg_start){
                        const x=event.clientX-this.mouse_dlg_start.x
                        const y=event.clientY-this.mouse_dlg_start.y
                        if(x!=0 && y!=0){
                            this.update(
                                cr.center.lon-x/cr.unitinvs.x,
                                cr.center.lat+y/cr.unitinvs.y,this.last_options)
                        }

                    }
                    this.mouse_dlg_start=undefined
                    break;
                case "mousedown":
                    this.mouse_dlg_start=new Point(event.clientX,event.clientY);
                    this.mouse_dlg_unitinv
                    break;
                case "mousemove":
                    if(this.mouse_dlg_start){
                        const x=event.clientX-this.mouse_dlg_start.x
                        const y=event.clientY-this.mouse_dlg_start.y
                        if(x!=0 && y!=0){
                            const ctx=this.canvas.getContext("2d")!;
                            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                            cr.renderToCanvas(ctx,x,y);
                        }

                    }
            }
        }
        super.handleClick(event);
    }      
      
    public dispose() {
        super.dispose();
        this.element.removeEventListener("wheel", this._wheelHandler);
    }
}

export class AacSelectedEvent extends CustomEvent<GaluchatAac> {
    public readonly aacode:GaluchatAac
    constructor(aacode:GaluchatAac) {
        super("aacSelected")
        this.aacode=aacode
    }
}
/**
 * 選択した場所の
 */
export class AAcSelectMapComponent extends ZoomInMapComponent {
    private selected_aac:GaluchatAac|null=null
    constructor(element: HTMLElement, mapProviders: IMapProvider[],default_map_index:number=0){
        super(element,mapProviders,default_map_index=default_map_index)
        this.addEventListener("dblclick",(e)=>{
            if(e instanceof MapMouseEvent){
                const ap=new WebApiAacProvider(this.mapProvider.mapset)
                ap.getCode(e.lonlat.lon,e.lonlat.lat).then((raac)=>{
                    if(raac.aacode==0){
                        this.update(e.lonlat.lon,e.lonlat.lat,undefined).then(()=>{
                            this.dispatchEvent(new AacSelectedEvent(raac));
                        });
                    }else if(this.selected_aac && raac.aacode==this.selected_aac.aacode){
                        //ntd
                    }else{
                        this.update(e.lonlat.lon,e.lonlat.lat,new MapOptions([raac.aacode])).then(()=>{
                            this.dispatchEvent(new AacSelectedEvent(raac));
                        });
                    }
                    this.selected_aac=raac
                });
            }
        });
    }
     
}
