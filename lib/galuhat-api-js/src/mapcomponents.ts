
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
    // public readonly lonlat:Lonlat;//選択位置の経緯度
    public readonly localPos:Point;//選択位置の経緯度
    public readonly mapinfo:GaluchatMap;//選択位置の経緯度
    constructor(type:string,event: Event, target:HTMLElement,mapinfo: GaluchatMap) {
        super(type, event);
        const e=event as PointerEvent
        const rect = target.getBoundingClientRect();
        this.localPos=new Point(e.clientX! - rect.left,e.clientY! - rect.top)
        // this.lonlat=
        this.mapinfo=mapinfo;
    }
    get lonlat():Lonlat{
        return this.mapinfo.point2Lonlat(this.localPos.x,this.localPos.y);
    }
}
/**
 * マップが更新されたとき
 */
export class MapUpdatedEvent extends CustomEvent<Lonlat> {
    constructor() {
        super("mapupdated")
    }
}

/**
 * 表示機能を備えたコンポーネント。
 * updateを実行する
 */
export class SimpleMapComponent extends EventTarget
{
    public readonly parent_element: HTMLElement;
    protected mapProvider: IMapProvider;
    #resizeObserver: ResizeObserver;
    protected last_options:MapOptions|undefined=undefined;
    protected canvas: HTMLCanvasElement;
    #_clickHandler: EventListener;
    #_pointerHandler: EventListener;    
    #_pointerHandler2: EventListener;
    /**
     * 現在表示中のマップ
     */
    public current_result:GaluchatMap|undefined;
    public async update(lon:number,lat:number,options?:MapOptions)
    {
        const width = this.parent_element.clientWidth;
        const height = this.parent_element.clientHeight;
        try {
            let mapImage
            if(width*height==0){
                //APIはサイズ0を作れないから。
                mapImage=new GaluchatMap(lon,lat,this.mapProvider.unit_invs,options,undefined)
                return
            }else{
                mapImage = await this.mapProvider.getMap(lon, lat, width, height,options?options:undefined);
                mapImage.renderToCanvas(this.canvas.getContext("2d")!);
            }
            this.last_options=options
            this.current_result=mapImage
            this.dispatchEvent(new MapUpdatedEvent())
        } catch (error) {
            this.current_result=undefined;
            console.error("Failed to update map:", error);
        }
    };

    constructor(element: HTMLElement, mapProvider: IMapProvider,with_update:boolean=true)
    {
        super();
        //要素の構築
        const c=document.createElement("canvas");
        c.style.position = "absolute"; // スクロール禁止
        element.style.overflow = "clip"; // スクロール禁止
        element.style.padding = "0"; // スクロール禁止
        element.style.position = "relative"; // スクロール禁止
        element.style.boxSizing = "border-box"; // スクロール禁止
        

        c.width=element.clientWidth
        c.height=element.clientHeight
        // this.update = (lon:number,lat:number,options?:MapOptions) => 

       
        this.canvas=c   
        element.appendChild(c);
        //イベントバインド
        let captured_point_ids:number[]=[]
        //downは範囲内のみ,moveとupはウインドウ全域にしてupまでイベントがモリモリする
        this.#_pointerHandler = (event:Event)=>{
            if(!this.current_result){
                return;
            }
            const e=event as PointerEvent
            if(e.type=="pointerdown" && captured_point_ids.indexOf(e.pointerId)==-1){
                captured_point_ids.push(e.pointerId)
            }
            this.dispatchEvent(new MapPointerEvent(event.type,event,this.parent_element,this.current_result));            
        }
        for(let i of ["pointerdown"]){
            element.addEventListener(i,this.#_pointerHandler)
        }
        this.#_pointerHandler2 = (event:Event)=>{
            if(!this.current_result){
                return;
            }
            const e=event as PointerEvent
            if(captured_point_ids.indexOf(e.pointerId)!=-1){
                switch(e.type){
                case "pointerup":
                    captured_point_ids=captured_point_ids.filter(x => x !==e.pointerId); 
                    break;
                }
                this.dispatchEvent(new MapPointerEvent(event.type,event,this.parent_element,this.current_result));
            }
        }
        for(let i of ["pointermove","pointerup"]){
            window.addEventListener(i,this.#_pointerHandler2)
        }

        this.#_clickHandler=(event: Event)=>{
            if(!this.current_result){
                return;
            }
            this.dispatchEvent(new MapMouseEvent(event,this.parent_element,this.current_result));
        }
        element.addEventListener("contextmenu",(e)=>{e.preventDefault()})
        for(let i of ["click","mousemove","mousedown","mouseup","dblclick"]){
            element.addEventListener(i,this.#_clickHandler)
            // c.addEventListener(i,()=>{},true)//イベント発生するようにする。
        }
        const debounceResize=debounce((w:number,h:number) => {
            // if(aa>10){
            //     return
            // }
            c.width=w
            c.height=h
            let cr=this.current_result
            if (cr){
                (async ()=>{
                    this.update(cr.center.lon,cr.center.lat,this.last_options)
                })()
            }
            },100);

        // リサイズ監視のセットアップ
        this.#resizeObserver = new ResizeObserver(() => {
            debounceResize(element.clientWidth,element.clientHeight);
            // console.log("resize")
        });
        // const init_ll=initial_lonlat?initial_lonlat:this.#DEFAULT_LONLA
        //debouncedResize(element.clientWidth,element.clientHeight);

        this.#resizeObserver.observe(element);
        //リソースの初期化
        this.parent_element = element;
        this.mapProvider = mapProvider;
        this.current_result=undefined;
        if(with_update){
            this.update(140.030,35.683)
        }
    }
    
    /**
     * マッププロバイダを更新する。更新と同時にアップデートを実行。失敗した場合はproviderを元に戻す。
     * @param provider 
     * @returns 
     */
    public async switchMapProvider(provider:IMapProvider,center:Lonlat|undefined=undefined){
        const old=this.mapProvider
        try{
            this.mapProvider=provider        
            let c=center
            if(!c){
                c=this.current_result?.center
            }
            if(!c){
                return
            }
            // const c=center?center:cr.center
            await this.update(c.lon,c.lat,this.last_options)
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

/**
 * マップを選択した時
 */
export class PointedEvent extends CustomEvent<Lonlat> {
    public readonly lonlat:Lonlat
    constructor(lonlat:Lonlat) {
        super("pointed")
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
    public get current_mapset_name():string{return this.#map_providers[this.current_map_provider_index].name}
    /**
     * 
     * @param element 
     * @param mapProviders 
     * マッププロバイダの配列。低解像度→高解像度で指定してね。
     * @param default_map_index 
     * 現在選択しているマッププロバイダ
     */

    constructor(element: HTMLElement, mapProviders: IMapProvider[],default_map_index:number=0,with_update:boolean=true)
    {
        super(element,mapProviders[default_map_index],with_update);
        this.#map_providers=mapProviders
        this.current_map_provider_index=default_map_index
        //イベントバインド
        class DlgInfo{
            last_pos:Point
            constructor(
                readonly id:number,
                readonly start_time:number,
                readonly start_pos:Point){this.last_pos=start_pos};
            static createFromEvent(e:MapPointerEvent){
                return new DlgInfo(e.pointerId,Date.now(),new Point(e.clientX,e.clientY))
            }
            get ellapse():number{
                return Date.now()-this.start_time
            }
            moveStartPos(x:number,y:number):DlgInfo{
                return new DlgInfo(this.id,this.start_time,this.start_pos.move(x,y))
            }
            updateLastPos(e:MapPointerEvent){
                this.last_pos=new Point(e.clientX,e.clientY)
            }
        }
        let drg_info:DlgInfo|undefined=undefined //ドラッグの開始点
        abstract class DlgMgr{
            /**
             * アクティブなポインタの配列
             */
            points:DlgInfo[]=[]
            /**
             * MT時の開始位置
             */
            mtstart?:Point=undefined
            #last_distance=0
            #last_single_tap:number=0
            #longtouch_handle:number|undefined=undefined

            /**
             * MT時の中心位置
             */
            get center():Point{
                let x=0
                let y=0
                for(let i of this.points){
                    x+=i.last_pos.x
                    y+=i.last_pos.y
                }
                return new Point(x/this.points.length,y/this.points.length)
            }
            get zoomStep():number{
                if(this.points.length<2){
                    return 0
                }
                const d=Point.distance(this.points[0].last_pos,this.points[1].last_pos)
                if(d>this.#last_distance*1.3){
                    this.#last_distance=d
                    return 1
                }else if(d<this.#last_distance*.7){
                    this.#last_distance=d
                    return -1
                }
                return 0
            }

            processEvent(e:MapPointerEvent):boolean
            {
                try{
                    if(e.pointerType=="touch"){
                        const points=this.points
                        switch(e.type){
                            // case "pointerup":{}
                            case "pointerdown":{
                                // console.log(`D:points:${points.length}`)
                                if(points.findIndex(o=> o.id==e.pointerId)!=-1){
                                    break
                                }
                                switch(points.length){
                                case 0:
                                    points.push(DlgInfo.createFromEvent(e))
                                    this.mtstart=points[0].start_pos
                                    const n=Date.now()
                                    if(n-this.#last_single_tap<300){
                                        this.onzoom(1,e.localPos)
                                        return true
                                    }
                                    this.#last_single_tap=n
                                    this.#longtouch_handle=setTimeout(()=>{
                                        this.onselect(e)},200
                                    )
                                    break
                                case 1:
                                    clearTimeout(this.#longtouch_handle);//長押しタイマのKill
                                    this.#longtouch_handle=undefined
                                    points.push(DlgInfo.createFromEvent(e))
                                    const w=points[1].last_pos.sub(points[0].last_pos)
                                    this.mtstart=new Point(this.mtstart!.x+w.x*.5,this.mtstart!.y+w.y*.5)
                                    this.#last_distance=Point.distance(points[0].last_pos,points[1].last_pos)
                                    break
                                default:
                                    break
                                }
                            }
                            break;
                            case "pointermove":{
                                clearTimeout(this.#longtouch_handle);//長押しタイマのKill
                                const idx=points.findIndex(i=>i.id==e.pointerId)
                                if(idx==-1){
                                    break
                                }
                                points[idx].updateLastPos(e)
                                const x=this.center.x-this.mtstart!.x
                                const y=this.center.y-this.mtstart!.y
                                // 使い勝手が悪いから今回はお倉IN
                                // if(points.length==2){
                                //     switch(this.zoomStep){
                                //     case 1:
                                //         this.onzoom(1,this.center)
                                //         return true
                                //     case -1:
                                //         this.onzoom(-1,this.center)
                                //         return true
                                //     }
                                    
                                // }
                                if(x*y!=0){
                                    this.onmove(e,x,y)//Event:確定(移動量)
                                }
                                
                                break
                            }
                            case "pointerup":{
                                clearTimeout(this.#longtouch_handle);//長押しタイマのKill
                                const idx=points.findIndex(i=>i.id==e.pointerId)
                                if(idx==-1){
                                    break
                                }
                                console.log(`U:points:${this.points.length}`)
                                points[idx].updateLastPos(e)
                                const x=this.center.x-this.mtstart!.x
                                const y=this.center.y-this.mtstart!.y
                                switch(points.length){
                                case 2:
                                    //centerの補正
                                    const w=points[1].last_pos.sub(points[0].last_pos)
                                    const sig=(idx==0)?.5:-.5;
                                    this.mtstart=new Point(this.mtstart!.x+w.x*sig,this.mtstart!.y+w.y*sig)
                                    this.points=points.filter(i=>i.id!=e.pointerId)
                                    return true//move継続
                                }
                                // const item=this.points[0]
                                
                                //event:完了。
                                if(x!=0 && y!=0){
                                    this.onmoved(e,x,y)//Event:確定(移動量)
                                }
                                //そのポインタを削除
                                this.points=this.points.filter(x => x.id !==e.pointerId); 
                                // console.log(`U2:points:${this.points.length}`)
                                break
                            }
                        }    

                    }else{
                        switch(e.type){
                            // case "pointerup":{}
                            case "pointerdown":{
                                if(this.points.length==0 && (e.buttons & 1)==1){
                                    this.points.push(DlgInfo.createFromEvent(e))
                                }
                            }
                            break;
                            case "pointermove":{
                                if(this.points.length==0 || this.points[0].id!=e.pointerId){
                                    break
                                }
                                const item=this.points[0]
                                const x=e.clientX-item.start_pos.x
                                const y=e.clientY-item.start_pos.y
                                if(x*y!=0){
                                    this.onmove(e,x,y)//Event:確定(移動量)
                                }
                                break
                            }
                            case "pointerup":{
                                if(this.points.length==0||this.points[0].id!=e.pointerId){
                                    break
                                }
                                if((e.buttons & 1)!=0){
                                    break
                                }
                                const item=this.points[0]
                                const x=e.clientX-item.start_pos.x
                                const y=e.clientY-item.start_pos.y
                                //event:完了。
                                if(x!=0 && y!=0){
                                    this.onmoved(e,x,y)//Event:確定(移動量)
                                }else if(item.ellapse<1000){
                                    this.onselect(e)//Event:座標選択(latlon)
                                }
                                //そのポインタを削除
                                this.points=this.points.filter(x => x.id !==e.pointerId); 
                                break
                            }
                        }    
                    }
                    return true
                }finally{
                    
                }
            }
            abstract onselect(e:MapPointerEvent):void;
            abstract onmove(e:MapPointerEvent,mx:number,my:number):void;
            abstract onmoved(e:MapPointerEvent,mx:number,my:number):void;
            abstract onzoom(zoomstep:number,center:Point):void;
            // zoomin(){}
            // zoomout(){}            
        }
        const _canvas=this.canvas
        const _this=this
        class A extends DlgMgr{
            onselect(e:MapPointerEvent ){
                _this.dispatchEvent(new PointedEvent(e.lonlat))
                // console.log(`select:${e.lonlat},${this.points.length}`)
            };
            onmoved(e:MapPointerEvent,mx:number,my:number){
                let cr=e.mapinfo
                _this.update(
                    cr.center.lon-mx/cr.unitinvs.x,
                    cr.center.lat+my/cr.unitinvs.y,_this.last_options)                
            }
            onmove(e:MapPointerEvent,mx:number,my:number){
                // console.log(`move:${mx},${my},${this.points.length}`)
                const ctx=_canvas.getContext("2d")!;
                ctx.clearRect(0, 0, _canvas.width, _canvas.height);
                e.mapinfo.renderToCanvas(ctx,mx,my);
            }
            onzoom(zoomstep:number,center:Point){
                switch(zoomstep){
                case 1:
                    _this.zoomIn(center)
                   break
                   case -1:
                    _this.zoomOut(center)
                   break
                }
            }
        };
        let a=new A()

        this.#_pointerHandler = (event:Event)=>{
            const e=event as  MapPointerEvent;
            a.processEvent(e)
        }
        for(let i of ["pointerup","pointerdown","pointermove"]){
            this.addEventListener(i,this.#_pointerHandler)
        }

        this.#_wheelHandler =(event: Event)=>{
            const e= event as WheelEvent;
            if(drg_info){
               return; //マウスのドラッグ操作中は何もしない
            }
            const rect = this.parent_element.getBoundingClientRect();
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
            let aac:number=NaN
            
            if (selected_aac) {
                aac=parseInt(selected_aac);
            }
            if (Number.isNaN(latStr) || Number.isNaN(lonStr)) {
                return false;
            }
            this.last_options=!isNaN(aac)?new MapOptions([aac]):undefined
            const index = this.#map_providers.findIndex(obj => obj.name === mapset);
            if(index<0){
                return false;
            }
            await this.switchMapProvider(this.#map_providers[mapset_idx],new Lonlat(Number.parseFloat(lonStr!),Number.parseFloat(latStr!)));
            this.current_map_provider_index=mapset_idx
            return true;
        } catch (error) {
            return false;
        }
    }
    /**
     * 現在表示中のマップを示すquery.updateByUrlで実行可能
     */
    public getQuerySuffix(lonlat?:Lonlat):string{
        if(lonlat){
            return `mapset=${this.current_mapset_name}&lon=${lonlat.lon}&lat=${lonlat.lat}${this.last_options?"&"+this.last_options.querySuffix:""}`
        }else{
            const c=this.current_result!.center
            return `mapset=${this.current_mapset_name}&lon=${c.lon}&lat=${c.lat}${this.last_options?"&"+this.last_options.querySuffix:""}`    
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
        this.parent_element.removeEventListener("wheel", this.#_wheelHandler);
    }
}


