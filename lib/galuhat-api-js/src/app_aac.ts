import {PointedEvent,ZoomInMapComponent} from "./mapcomponents.ts";
import {WebApiMapProvider,MapOptions,} from "./mapprovider.ts";
import {WebApiAacProvider,GaluchatAac} from "./geocodeprovider.ts";
import {Lonlat} from "./galuchat-typse.ts"
import {debounce} from "./utils.ts"
import './styles.less';


var mps=[
    new WebApiMapProvider("ma100"),
    new WebApiMapProvider("ma1000"),
    new WebApiMapProvider("ma10000")
]

class AacApp{
    static readonly TAG_INFOBOX =document.getElementById("infobox")! as HTMLInputElement;
    static readonly TAG_CODETEXT=document.getElementById("codetext")! as HTMLInputElement;
    static readonly TAG_ZOOMIN =document.getElementById("zoom-in")! as HTMLInputElement;
    static readonly TAG_ZOOMOUT=document.getElementById("zoom-out")! as HTMLInputElement;
    readonly component:ZoomInMapComponent
    current_aac:GaluchatAac|undefined
    // public selected_aac:GaluchatAac

    /**
     * ヘッドラインを更新
     * @param raac 
     */
    async updateHeaderLine(raac?:GaluchatAac){
        const info_tag=AacApp.TAG_INFOBOX
        const code_tag=AacApp.TAG_CODETEXT
        let info:string=""
        if(raac==undefined){
            code_tag.innerText=`-`;
            info=`行政区域を選択してください`;
        }else if(raac.aacode==0){
            code_tag.innerText=`-`;
            info=`海上`;

            //tag.value=""
        }else if(raac.address==null){
            code_tag.innerText=`${raac.aacode}`;
            info=`所属不明地`;
        }else{
            code_tag.innerText=`${raac.aacode}`;
            info=`${raac.address.prefecture} ${raac.address.city}`;
        }
        info_tag.innerHTML=`<span style='white-space: nowrap;'>${info}</span>`

        const child = info_tag.querySelector('span')!;
        const parentWidth = info_tag.getBoundingClientRect().width;
        let childWidth = child.getBoundingClientRect().width+32;
        // 子要素の幅が親要素の幅を超えている場合、フォントサイズを調整する
        if (childWidth > parentWidth) {
          // 現在のフォントサイズを取得（単位は px と仮定）
          const computedStyle = window.getComputedStyle(child);
          let fontSize = parseFloat(computedStyle.fontSize);
        
          // 子要素が収まるための縮小比率を算出
          const scaleFactor = parentWidth / childWidth;
          if(scaleFactor>.5 || raac==undefined){
            // 新しいフォントサイズを計算し、設定
            const newFontSize = fontSize * scaleFactor;
            child.style.fontSize = newFontSize + 'px';
          }else{
            info=`<span style='white-space: nowrap;'>${raac.address.prefecture}</span><br/><span style='white-space: nowrap;'>${raac.address.city}</span>`;
            info_tag.innerHTML=info
            const childlen = info_tag.querySelectorAll('span')!;
            // ループでフォントサイズを適用
            childlen.forEach(span => {
              span.style.fontSize = (fontSize * 0.5) + 'px';
            });            
          }
        }
    }

    #last_aac_provider:WebApiAacProvider|undefined
    async updateCurrentCode(lonlat:Lonlat):Promise<void>{
        if(!this.#last_aac_provider || this.#last_aac_provider.mapset_name!=this.component.current_mapset_name){
            this.#last_aac_provider=new WebApiAacProvider(this.component.current_mapset_name)
        }
        this.current_aac=await this.#last_aac_provider!.getCode(lonlat)
        await this.updateHeaderLine(this.current_aac)
    }    
    public constructor(url:URL)
    {
        const map_element=document.getElementById("map")!
        this.component=new ZoomInMapComponent(map_element!,mps,0,false);
        AacApp.TAG_ZOOMIN.addEventListener("click",()=>{this.component.zoomIn()})
        AacApp.TAG_ZOOMOUT.addEventListener("click",()=>{this.component.zoomOut()})
        this.component.addEventListener("pointed",(e)=>{
            if(e instanceof PointedEvent){
                this.updateCurrentCode(e.lonlat).then(()=>{
                    if(this.current_aac){
                        const cp=this.component.current_result!.center
                        const mop=this.current_aac.aacode!=0?new MapOptions([this.current_aac.aacode]):undefined
                        this.component.update(cp.lon,cp.lat,mop).then(()=>{
                            const params = new URLSearchParams(window.location.search);
                            params.set("key", "value");
                            window.history.replaceState({}, "", `${window.location.pathname}?${this.component.getQuerySuffix(e.lonlat)}`);        
                        })
                    }        
                })
            }
        });
        this.component.addEventListener("mapupdated",()=>{
        });

        //初期描画
        this.component.updateByUrl(url).then((f)=>{
            if(!f){
                const DEFAULT_LONLA=new Lonlat(140.030,35.683)
                this.component.update(DEFAULT_LONLA.lon,DEFAULT_LONLA.lat)
                this.updateHeaderLine()
                // AacApp.TAG_CODETEXT.innerText=""
                // AacApp.TAG_INFOBOX.innerHTML=("<span>行政区域を選択してください</span>");
            }else{
                if(this.component.getQuerySuffix().indexOf("aac=")!=-1){
                    this.updateCurrentCode(this.component.current_result!.center).then(()=>{
                    })    
                }else{
                    this.updateHeaderLine()
    
                }
            }
        })
        // リサイズ監視のセットアップ
        const dreize=debounce(()=>{
            this.updateHeaderLine(this.current_aac)
            },100);
        
        const ro=new ResizeObserver(() => {
            dreize()
        });
        ro.observe(this.component.parent_element)

    }
}



window.onload = function() {
    const urlObj = new URL(window.location.href);
    new AacApp(urlObj)
}


