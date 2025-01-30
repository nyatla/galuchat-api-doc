import * as f1 from "./mapcomponents.ts";
import * as f2 from "./mapprovider.ts";
import * as f3 from "./geocodeprovider.ts"
var GaluchatApiJs={
    ...f1,
    ...f2,
    ...f3

};
console.log(typeof GaluchatApiJs)
window.onload = function() {
 var mps=[
    new GaluchatApiJs.WebApiMapProvider("ma100"),
    new GaluchatApiJs.WebApiMapProvider("ma1000"),
    new GaluchatApiJs.WebApiMapProvider("ma10000")
 ]
 var cmp=new GaluchatApiJs.JccSelectMapComponent(document.getElementById("main")!,mps);
 cmp.update(139.7264605,35.7285215);
 
 cmp.addEventListener('click',(e:Event)=>{
    if(e instanceof GaluchatApiJs.MapMouseEvent){ //OK
        // cmp.update(e.lonlat.lon, e.lonlat.lat);
        // let t=new GaluchatApiJs.WebApiJccProvider("ma10000")
        // t.getCode(e.lonlat.lon,e.lonlat.lat).then((a)=>{console.log(a)})
        // t.getCode(e.lonlat.lon,e.lonlat.lat).then((a)=>{console.log(a)})


        console.log("クリック位置:", e.lonlat.lon, e.lonlat.lat)
    }
    // console.log("e3s3ss");
});
cmp.addEventListener('jccSelected',(e:Event)=>{
    if(e instanceof GaluchatApiJs.JccSelectedEvent){ //OK
        const tag=document.getElementById("result")! as HTMLInputElement;
        console.log(e.jcc)
        if(e.jcc.aacode==0){
            tag.value=""
        }else if(e.jcc.jcc==null){
            tag.value=`${e.jcc.aacode} 所属不明地`;
        }else{
            tag.value=`${e.jcc.jcc.code} ${e.jcc.jcc.name} (${e.jcc.jcc.name_en})`;
        }

        // cmp.update(e.lonlat.lon, e.lonlat.lat);
        // console.log("M", e.lonlat.lon, e.lonlat.lat)
    }
    // console.log("e3s3ss");
});
document.getElementById("zoomin")?.addEventListener("click",()=>{cmp.zoomIn()})
document.getElementById("zoomout")?.addEventListener("click",()=>{cmp.zoomOut()})
 //var img=new GaluchatApiJs.WebApiMapProvider();
// img.getMap(134.72,35.6,100,100,100).then();
}
// alert(1);

