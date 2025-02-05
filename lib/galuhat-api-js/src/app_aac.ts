import {PointedEvent,ZoomInMapComponent} from "./mapcomponents.ts";
import {WebApiMapProvider,MapOptions} from "./mapprovider.ts";
import {WebApiJccProvider, WebApiAacProvider,} from "./geocodeprovider.ts";
import {Lonlat} from "./galuchat-typse.ts"
import './styles.less';


var mps=[
    new WebApiMapProvider("ma100"),
    new WebApiMapProvider("ma1000"),
    new WebApiMapProvider("ma10000")
]
class AppBase{
    constructor(readonly component:ZoomInMapComponent){};
}
class AacApp extends AppBase{
    // public selected_aac:GaluchatAac
    static createCmp():ZoomInMapComponent{
        const cmp=new ZoomInMapComponent(document.getElementById("map")!,mps,0);
        document.getElementById("zoom-in")?.addEventListener("click",()=>{cmp.zoomIn()})
        document.getElementById("zoom-out")?.addEventListener("click",()=>{cmp.zoomOut()})
        document.getElementById("map_title")!.innerText="行政区域コード";        
        return cmp;
    }
    public constructor(url:URL){
        super(AacApp.createCmp())
        this.component.addEventListener("pointed",(e)=>{
            if(e instanceof PointedEvent){
                const ap=new WebApiAacProvider(this.component.currentMapSet)
                ap.getCode(e.lonlat.lon,e.lonlat.lat).then((raac)=>{
                    const tag=document.getElementById("info-box")! as HTMLInputElement;
                    let mop:MapOptions|undefined=undefined

                    if(raac.aacode==0){
                        //tag.value=""
                    }else if(raac.address==null){
                        tag.value=`${raac.aacode} 所属不明地`;
                        mop=new MapOptions([raac.aacode])
                    }else{
                        tag.value=`${raac.aacode} ${raac.address.prefecture} ${raac.address.city}`;
                        mop=new MapOptions([raac.aacode])
                    }
                    if(mop){
                        const cp=this.component.current_result!.center
                        this.component.update(cp.lon,cp.lat,mop)
                    }
                    // this.selected_aac=raac
                });
            }
        });
        //
        if(!this.component.updateByUrl(url)){
            const DEFAULT_LONLA=new Lonlat(140.030,35.683)
            this.component.update(DEFAULT_LONLA.lon,DEFAULT_LONLA.lat)
        }
    }
}

class JccApp extends AppBase{
    // public selected_aac:GaluchatAac
    static createCmp():ZoomInMapComponent{
        const init_ll=new Lonlat(140.0289933,35.6837434)
        const cmp=new ZoomInMapComponent(document.getElementById("map")!,mps,0,init_ll);
        document.getElementById("zoom-in")?.addEventListener("click",()=>{cmp.zoomIn()})
        document.getElementById("zoom-out")?.addEventListener("click",()=>{cmp.zoomOut()})
        document.getElementById("map_title")!.innerText="JARL市郡区コードマップ";        
        return cmp;
    }
    public constructor(url:URL){
        super(JccApp.createCmp())
        this.component.addEventListener("pointmap",(e)=>{
            if(e instanceof PointedEvent){
                const ap=new WebApiJccProvider(this.component.currentMapSet)
                ap.getCode(e.lonlat.lon,e.lonlat.lat).then((rjcc)=>{
                    const tag=document.getElementById("info-box")! as HTMLInputElement;
                    if(rjcc.aacode==0){
                        tag.value=""
                    }else if(rjcc.jcc==null){
                        tag.value=`${rjcc.aacode} 所属不明地`;
                    }else{
                        tag.value=`${rjcc.aacode} ${rjcc.jcc.name} (${rjcc.jcc.name_en})`;
                    }
                    // this.selected_aac=raac
                });
            }
        });
    }
}




window.onload = function() {

    const urlObj = new URL(window.location.href);
    const params = new URLSearchParams(urlObj.search);
    switch(params.get("m")){
    case "jcc":
        new JccApp(urlObj)
        break
    case "aac":
    default:
        new AacApp(urlObj)
    }
}


