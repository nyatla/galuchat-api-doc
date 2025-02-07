import {PointedEvent,ZoomInMapComponent} from "./mapcomponents.ts";
import {WebApiMapProvider,MapOptions,} from "./mapprovider.ts";
import {WebApiJccProvider,GaluchatJcc} from "./geocodeprovider.ts";
import {Lonlat} from "./galuchat-typse.ts"
import {ShareDialog} from "./ui/ShareDialog.ts"
import {debounce} from "./utils.ts"
import './styles.less';


var mps=[
    new WebApiMapProvider("ma100"),
    new WebApiMapProvider("ma1000"),
    new WebApiMapProvider("ma10000")
]

class JccApp{
    static readonly TAG_INFOBOX =document.getElementById("infobox")! as HTMLInputElement;
    static readonly TAG_CODETEXT=document.getElementById("codetext")! as HTMLInputElement;
    static readonly TAG_ZOOMIN =document.getElementById("zoom-in")! as HTMLInputElement;
    static readonly TAG_ZOOMOUT=document.getElementById("zoom-out")! as HTMLInputElement;
    static readonly TAG_SHARE=document.getElementById("share")! as HTMLInputElement;    
    readonly component:ZoomInMapComponent
    current_jcc:GaluchatJcc|undefined
    current_text_description:string=""

    /**
     * ヘッドラインを更新
     * @param rjcc 
     */
    async updateHeaderLine(rjcc?:GaluchatJcc){
        const info_tag=JccApp.TAG_INFOBOX
        const code_tag=JccApp.TAG_CODETEXT
        let info:string=""
        let ol_info:string=""
        if(rjcc==undefined){
            code_tag.innerText=`-`;
            info=`<div>行政区域を選択してください</div>`;
            ol_info="未選択"
        }else if(rjcc.aacode==0){
            code_tag.innerText=`-`;
            info=`<div>海上</div>`;
            ol_info="海上"
        }else if(rjcc.jcc==null){
            code_tag.innerText=`-`;
            info=`<div>所属不明地</div>`;
            ol_info="所属不明"
        }else{
            code_tag.innerText=`${rjcc.jcc.code}`;
            info=
`<ul style="list-style-type: none; padding: 0; margin: 0;text-align:center;">
    <li style="font-size: 2em; font-weight: bold;line-height:1.1;white-space: nowrap;">${rjcc.jcc.name}</li>
    <li style="font-size: 1.2em;line-height:1;line-height:1">${rjcc.jcc.name_en}</li>
</ul>`;
            ol_info=`JARL市郡区番号 ${rjcc.jcc.code},${rjcc.jcc.name}(${rjcc.jcc.name_en})`
        }
        this.current_text_description=ol_info
        info_tag.innerHTML=`${info}`

        const child = info_tag.children.item(0) as HTMLElement;
        const parentWidth = info_tag.getBoundingClientRect().width;
        let childWidth = child.getBoundingClientRect().width+32;
        // 子要素の幅が親要素の幅を超えている場合、フォントサイズを調整する
        if (childWidth > parentWidth) {
          // 現在のフォントサイズを取得（単位は px と仮定）
          const computedStyle = window.getComputedStyle(child);
          const fontSize = parseFloat(computedStyle.fontSize);
        
          // 子要素が収まるための縮小比率を算出
          const scaleFactor = parentWidth / childWidth;
          if(scaleFactor>.5 || rjcc==undefined){
            // 新しいフォントサイズを計算し、設定
            const newFontSize = fontSize * scaleFactor;
            child.style.fontSize = newFontSize + 'px';
          }else{
            let texts=[]
            for(let i of rjcc.jcc.name.split(" ")){
                texts.push(`<span style="white-space: nowrap;">${i}</span>`)
            }
            info_tag.innerHTML=`<div style="font-size: 2em;text-align:center;">${texts.join(" ")}</div>`
            const child = info_tag.children.item(0) as HTMLElement; 
            child.style.fontSize=(fontSize) + 'px';          
            console.log(child.style.fontSize);
          }
        }
    }

    #last_jcc_provider:WebApiJccProvider|undefined
    async updateCurrentCode(lonlat:Lonlat):Promise<void>{
        if(!this.#last_jcc_provider || this.#last_jcc_provider.mapset_name!=this.component.current_mapset_name){
            this.#last_jcc_provider=new WebApiJccProvider(this.component.current_mapset_name)
        }
        this.current_jcc=await this.#last_jcc_provider!.getCode(lonlat)
        await this.updateHeaderLine(this.current_jcc)
    }    
    public constructor(url:URL)
    {
        const map_element=document.getElementById("map")!
        this.component=new ZoomInMapComponent(map_element!,mps,0,false);
        JccApp.TAG_ZOOMIN.addEventListener("click",()=>{this.component.zoomIn()})
        JccApp.TAG_ZOOMOUT.addEventListener("click",()=>{this.component.zoomOut()})
        const share_dlg=new ShareDialog()
        JccApp.TAG_SHARE.addEventListener("click",()=>{
            share_dlg.showDialog(window.location.href,this.current_text_description,"JARL市郡区番号マップ")
        });        
        this.component.addEventListener("pointed",(e)=>{
            if(e instanceof PointedEvent){
                this.updateCurrentCode(e.lonlat).then(()=>{
                    if(this.current_jcc){
                        const cp=this.component.current_result!.center
                        const mop=this.current_jcc.aacode!=0?new MapOptions([this.current_jcc.aacode]):undefined
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
            this.updateHeaderLine(this.current_jcc)
            },100);
        
        const ro=new ResizeObserver(() => {
            dreize()
        });
        ro.observe(this.component.parent_element)

    }
}



window.onload = function() {
    const urlObj = new URL(window.location.href);
    new JccApp(urlObj)
}


