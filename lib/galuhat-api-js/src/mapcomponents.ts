
import {debounce} from "./utils"
import {Lonlat,Point} from "./galuchat-typse"
import {IMapProvider,GaluchatMap, MapOptions} from "./mapprovider"
import {GaluchatAac,WebApiAacProvider,WebApiJccProvider,GaluchatJcc} from "./geocodeprovider"






export class MapMouseEvent extends MouseEvent {
    public readonly lonlat:Lonlat;//選択位置の経緯度
    constructor(event: Event, target:HTMLElement,mapinfo: GaluchatMap) {
        super(event.type, event);
        const e=event as MouseEvent
        const rect = target.getBoundingClientRect();
        this.lonlat=mapinfo.point2Lonlat(e.clientX! - rect.left,e.clientY! - rect.top);
    }
}
export class MapPointerEvent extends PointerEvent {
    public readonly lonlat:Lonlat;//選択位置の経緯度
    public readonly mapinfo:GaluchatMap;//選択位置の経緯度
    constructor(event: Event, target:HTMLElement,mapinfo: GaluchatMap) {
        super(event.type, event);
        const e=event as PointerEvent
        const rect = target.getBoundingClientRect();
        this.lonlat=mapinfo.point2Lonlat(e.clientX! - rect.left,e.clientY! - rect.top);
        this.mapinfo=mapinfo;
    }
}

/**
 * 表示機能を備えたコンポーネント。
 * updateを実行する
 */
export class SimpleMapComponent extends EventTarget {
    protected element: HTMLElement;
    protected mapProvider: IMapProvider;
    #resizeObserver: ResizeObserver;
    protected last_options:MapOptions|undefined=undefined;
    protected canvas: HTMLCanvasElement;
    #_clickHandler: EventListener;
    #_pointerHandler: EventListener;    
    /**
     * 現在表示中のマップ
     */
    public current_result:GaluchatMap|undefined;
    public update: (lon:number,lat:number,options?:MapOptions) => void;

    constructor(element: HTMLElement, mapProvider: IMapProvider,with_update:boolean=true)
    {
        super();
        //要素の構築
        const c=document.createElement("canvas");
        c.width=element.clientWidth
        c.height=element.clientHeight
        this.update = debounce((lon:number,lat:number,options?:MapOptions) => {
            (async()=>{
                console.log("up")
                const width = this.element.clientWidth;
                const height = this.element.clientHeight;
                try {
                    let mapImage
                    if(width*height==0){
                        //APIはサイズ0を作れないから。
                        const imageData = new ImageData(0, 0); // 0×0 の ImageData を作成
                        const bitmap = await createImageBitmap(imageData); // ImageBitmap を作成
                        mapImage=new GaluchatMap(lon,lat,this.mapProvider.unit_invs,options,bitmap)
                        return
                    }else{
                        mapImage = await this.mapProvider.getMap(lon, lat, width, height,options?options:undefined);
                        mapImage.renderToCanvas(this.canvas.getContext("2d")!);    
                    }
                    this.last_options=options
                    this.current_result=mapImage            
                } catch (error) {
                    this.current_result=undefined;
                    console.error("Failed to update map:", error);
                }
            })();
        }, 100);

       
        this.canvas=c   
        element.appendChild(c);
        //イベントバインド
        this.#_pointerHandler = (event:Event)=>{
            if(!this.current_result){
                return;
            }
            this.dispatchEvent(new MapPointerEvent(event,this.element,this.current_result));            
        }
        for(let i of ["pointerup","pointerdown","pointermove"]){
            element.addEventListener(i,this.#_pointerHandler)
            // c.addEventListener(i,()=>{},true)//イベント発生するようにする。
        }

        this.#_clickHandler=(event: Event)=>{
            if(!this.current_result){
                return;
            }
            this.dispatchEvent(new MapMouseEvent(event,this.element,this.current_result));
        }
        for(let i of ["click","mousemove","mousedown","mouseup","dblclick"]){
            element.addEventListener(i,this.#_clickHandler)
            // c.addEventListener(i,()=>{},true)//イベント発生するようにする。
        }
        const debounceResize=debounce((w:number,h:number) => {
            c.width=w
            c.height=h
            let cr=this.current_result
            if (cr){
                (async ()=>{
                    this.update(cr.center.lon,cr.center.lat)
                })()
            }
            },100);

        // リサイズ監視のセットアップ
        this.#resizeObserver = new ResizeObserver(() => {
            debounceResize(element.clientWidth,element.clientHeight);
            console.log("resize")
        });
        // const init_ll=initial_lonlat?initial_lonlat:this.#DEFAULT_LONLA
        //debouncedResize(element.clientWidth,element.clientHeight);

        this.#resizeObserver.observe(element);
        //リソースの初期化
        this.element = element;
        this.mapProvider = mapProvider;
        this.current_result=undefined;
        if(with_update){
            this.update(140.030,35.683)
        }
    }
    // public async update(lon:number,lat:number,options:undefined|MapOptions=undefined){
    //     const width = this.element.clientWidth;
    //     const height = this.element.clientHeight;
    //     try {
    //         let mapImage
    //         if(width*height==0){
    //             //APIはサイズ0を作れないから。
    //             const imageData = new ImageData(0, 0); // 0×0 の ImageData を作成
    //             const bitmap = await createImageBitmap(imageData); // ImageBitmap を作成
    //             mapImage=new GaluchatMap(lon,lat,this.mapProvider.unit_invs,options,bitmap)
    //             return
    //         }else{
    //             mapImage = await this.mapProvider.getMap(lon, lat, width, height,options?options:undefined);
    //             mapImage.renderToCanvas(this.canvas.getContext("2d")!);    
    //         }
    //         this.last_options=options
    //         this.current_result=mapImage            
    //     } catch (error) {
    //         this.current_result=undefined;
    //         console.error("Failed to update map:", error);
    //     }
    // }
    /**
     * マッププロバイダを更新する。更新と同時にアップデートを実行。失敗した場合はproviderを元に戻す。
     * @param provider 
     * @returns 
     */
    public async switchMapProvider(provider:IMapProvider,center:Lonlat|undefined=undefined){
        const old=this.mapProvider
        try{
            this.mapProvider=provider        
            const cr=this.current_result
            if(cr==undefined){
                return;
            }
            const c=center?center:cr.center
            this.update(c.lon,c.lat,this.last_options)
        }catch{
            this.mapProvider=old
            console.error("can not switch map provider")
        }
    }



    /**
     * クリーンアップ処理
     */
    public dispose() {
        //めんどくさいからあとで！
        // this.element.removeEventListener("click", this._clickHandler);
        // this.element.removeEventListener("click", this._pointerHandler);
        this.#resizeObserver.disconnect();
    }

}


export class PointMapEvent extends CustomEvent<Lonlat> {
    public readonly lonlat:Lonlat
    constructor(lonlat:Lonlat) {
        super("pointmap")
        this.lonlat=lonlat
    }
}
/**
 * ズームイン/ズームアウト/ドラッグで移動のできるマップ。
 * 解像度変更はマップ切替
 */
export class ZoomInMapComponent extends SimpleMapComponent {
    #map_providers: IMapProvider[];   //
    private current_map_provider_index:number;     //現在選択しているマッププロバイダ
    #_wheelHandler: EventListener;
    #_pointerHandler: EventListener;
    public get currentMapSet():string{return this.#map_providers[this.current_map_provider_index].name}
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
        this.#map_providers=mapProviders
        this.current_map_provider_index=default_map_index
        //イベントバインド
        class DlgInfo{
            readonly start_time:number
            readonly start_pos:Point
            readonly start_lonlat:Lonlat
            constructor(start_pos:Point,start_lonlat:Lonlat){
                this.start_time=Date.now()
                this.start_pos=start_pos
                this.start_lonlat=start_lonlat
            }
            get ellapse():number{
                return Date.now()-this.start_time
            }
        }      
        let drg_info:DlgInfo|undefined=undefined //ドラッグの開始点
        
    

        this.#_pointerHandler = (event:Event)=>{
            const e=event as  MapPointerEvent;
            let cr=e.mapinfo
            switch(e.type){
            case "pointerup":
                if(!drg_info){
                    break;
                }
                const x=e.clientX-drg_info.start_pos.x
                const y=e.clientY-drg_info.start_pos.y
                    if(x!=0 && y!=0){
                    this.update(
                        cr.center.lon-x/cr.unitinvs.x,
                        cr.center.lat+y/cr.unitinvs.y,this.last_options)
                }else if(drg_info.ellapse<1000){
                    this.dispatchEvent(new PointMapEvent(drg_info.start_lonlat))

                }

                drg_info=undefined
                break
            case "pointerdown":
                
                // alert(e.type)
                // const touchCount = e.pointerType === 'touch' ? e.getCoalescedEvents().length : 0;
                // alert(touchCount)
                // if(e.pointerType=="touch" && touchCount>1){
                //     //ズーム処理
                // }else{
                // }
                //クリック|移動処理
                drg_info=new DlgInfo(new Point(e.clientX,e.clientY),e.lonlat);
                break
            case "pointermove":
                if(drg_info){
                    const x=e.clientX-drg_info.start_pos.x
                    const y=e.clientY-drg_info.start_pos.y
                    if(x!=0 && y!=0){
                        const ctx=this.canvas.getContext("2d")!;
                        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                        cr.renderToCanvas(ctx,x,y);
                    }
                }                
                break
            }
        }
        for(let i of ["pointerup","pointerdown","pointermove"]){
            this.addEventListener(i,this.#_pointerHandler)
        }

        this.#_wheelHandler =(event: Event)=>{
            const e= event as WheelEvent;
            if(drg_info){
               return; //マウスのドラッグ操作中は何もしない
            }
            const rect = this.element.getBoundingClientRect();
            const pos=new Point(e.clientX! - rect.left,e.clientY! - rect.top);        
            if (e.deltaY > 0) {
                this.zoomOut(pos)
            } else {
                this.zoomIn(pos)
            }
            e.preventDefault();   // スクロールを無効化
            e.stopPropagation();  // 伝播を防ぐ
        }
        element.addEventListener("wheel",this.#_wheelHandler);
    }
    /**
     * urlパラメータを解析して可能ならマップをロードする。
     * @param url 
     * @returns 
     */
    public async updateByUrl(url:URL):Promise<boolean>
    {
        try {
            const params = new URLSearchParams(url.search);
            
            const mapset = params.get("mapset");
            const selected_aac = params.get("aac");
            const latStr = params.get("lat");
            const lonStr = params.get("lon");

            let mapset_idx=this.current_map_provider_index

            if(mapset){
                const index = this.#map_providers.findIndex(obj => obj.name === mapset);
                if(index<0){
                    return false;
                }
                mapset_idx=index    
            }
            let aac=undefined
            
            if (Number.isInteger(selected_aac)) {
                aac=parseInt(selected_aac!);
            }
            if (Number.isNaN(latStr) || Number.isNaN(lonStr)) {
                return false;
            }
            
            const index = this.#map_providers.findIndex(obj => obj.name === mapset);
            if(index<0){
                return false;
            }
            //mapセットの切替
            if(this.current_map_provider_index!=mapset_idx){
                this.switchMapProvider(this.#map_providers[mapset_idx],new Lonlat(Number.parseFloat(lonStr!),Number.parseFloat(latStr!)));
                this.current_map_provider_index=mapset_idx
            }         
            return true;
        } catch (error) {
            return false;
        }
    }
    /**
     * 地図上の点を中心に
     * @param pos 
     * @returns 
     */
    public async zoomOut(pos:Point|undefined=undefined)
    {
        if(this.current_map_provider_index==0 || this.current_result==null){
            return false
        }
        const mps=this.#map_providers
        //スケールの計算
        const new_map=mps[this.current_map_provider_index-1]
        const old_map=mps[this.current_map_provider_index]
        this.current_map_provider_index-=1      
        var lonlat:Lonlat|undefined=undefined

        if(pos!=undefined){
            // const scale=new UnitInvs(new_map.unit_invs.x/old_map.unit_invs.x,new_map.unit_invs.y/old_map.unit_invs.y)
            //LatLonへ変換
            const ll=this.current_result.point2Lonlat(pos.x,pos.y)
            const l0=this.current_result.point2Lonlat(0,0)
            //起点変換
            const os=old_map.unit_invs
            const ns=new_map.unit_invs        
            const x=((ns.x-os.x)*ll.lon+os.x*l0.lon)/ns.x+this.current_result.width/2/ns.x
            const y=((ns.y-os.y)*ll.lat+os.y*l0.lat)/ns.y-this.current_result.height/2/ns.y
            // console.log("ZI",this.current_result.center,"->",[x,y])
            lonlat=new Lonlat(x,y)
        }
        await this.switchMapProvider(new_map,lonlat)
        // await this.switchMapProvider(new_map)
        return true
    }
    public async zoomIn(pos:Point|undefined=undefined){
        if(this.current_map_provider_index>=this.#map_providers.length-1|| this.current_result==null){
            return false
        }
        const mps=this.#map_providers
        //スケールの計算
        const new_map=mps[this.current_map_provider_index+1]
        const old_map=mps[this.current_map_provider_index]
        this.current_map_provider_index+=1        
        var lonlat:Lonlat|undefined=undefined

        if(pos!=undefined){
            // const scale=new UnitInvs(new_map.unit_invs.x/old_map.unit_invs.x,new_map.unit_invs.y/old_map.unit_invs.y)
            //LatLonへ変換
            const ll=this.current_result.point2Lonlat(pos.x,pos.y)
            const l0=this.current_result.point2Lonlat(0,0)
            //起点変換
            const os=old_map.unit_invs
            const ns=new_map.unit_invs        
            const x=((ns.x-os.x)*ll.lon+os.x*l0.lon)/ns.x+this.current_result.width/2/ns.x
            const y=((ns.y-os.y)*ll.lat+os.y*l0.lat)/ns.y-this.current_result.height/2/ns.y
            // console.log("ZI",this.current_result.center,"->",[x,y])
            lonlat=new Lonlat(x,y)
        }
        await this.switchMapProvider(new_map,lonlat)
        return true
    }


    
      
    public dispose() {
        super.dispose();
        this.element.removeEventListener("wheel", this.#_wheelHandler);
    }
}

// export class AacSelectedEvent extends CustomEvent<GaluchatAac> {
//     public readonly aac:GaluchatAac
//     constructor(aacode:GaluchatAac) {
//         super("pointmap")
//         this.aac=aacode
//     }
// }
// /**
//  * 地域選択可能なマップ
//  */
// export class AAcSelectMapComponent extends ZoomInMapComponent {
//     private selected_aac:GaluchatAac|null=null
//     constructor(element: HTMLElement, mapProviders: IMapProvider[],default_map_index:number=0,initial_lonlat:Lonlat|undefined=undefined){
//         super(element,mapProviders,default_map_index=default_map_index,initial_lonlat=initial_lonlat)
//         this.addEventListener("pointmap",(e)=>{
//             if(e instanceof PointMapEvent){
//                 const ap=new WebApiAacProvider(this.mapProvider.mapset)
//                 ap.getCode(e.lonlat.lon,e.lonlat.lat).then((raac)=>{
//                     if(raac.aacode==0){
//                         this.dispatchEvent(new AacSelectedEvent(raac));
//                     }else if(this.selected_aac && raac.aacode==this.selected_aac.aacode){
//                         //ntd
//                     // }else if(raac.address==null){
//                     }else{
//                         this.update(this.current_result!.center.lon,this.current_result!.center.lat,new MapOptions([raac.aacode])).then(()=>{
//                             this.dispatchEvent(new AacSelectedEvent(raac));
//                         });
//                     }
//                     this.selected_aac=raac
//                 });
//             }
//         });
//     }
     
// }


// export class JccSelectedEvent extends CustomEvent<GaluchatAac> {
//     public readonly jcc:GaluchatJcc
//     constructor(jcc:GaluchatJcc) {
//         super("pointmap")
//         this.jcc=jcc
//     }
// }
// export class JccSelectMapComponent extends ZoomInMapComponent {
//     private selected_jcc:GaluchatJcc|null=null
//     constructor(element: HTMLElement, mapProviders: IMapProvider[],default_map_index:number=0,initial_lonlat:Lonlat|undefined=undefined){
//         super(element,mapProviders,default_map_index=default_map_index,initial_lonlat=initial_lonlat)
//         this.addEventListener("pointmap",(e)=>{
//             //マウスのみ
//             if(e instanceof PointMapEvent){
//                 const ap=new WebApiJccProvider(this.mapProvider.mapset)
//                 ap.getCode(e.lonlat.lon,e.lonlat.lat).then((rjcc)=>{
//                     if(rjcc.aacode==0){
//                         this.dispatchEvent(new JccSelectedEvent(rjcc));
//                     }else if(this.selected_jcc && rjcc.aacode==this.selected_jcc.aacode){
//                         //ntd
//                     // }else if(raac.address==null){
//                     }else{
//                         this.update(this.current_result!.center.lon,this.current_result!.center.lat,new MapOptions([rjcc.aacode])).then(()=>{
//                             this.dispatchEvent(new JccSelectedEvent(rjcc));
//                         });
//                     }
//                     this.selected_jcc=rjcc
//                 });
//             }
//         });
//     }
     
// }