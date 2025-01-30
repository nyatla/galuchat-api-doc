import * as f1 from "./sample.ts";
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
 var cmp=new GaluchatApiJs.AAcSelectMapComponent(document.getElementById("main")!,mps);
 cmp.update(134.72,35.6);
 
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
cmp.addEventListener('aacSelected',(e:Event)=>{
    if(e instanceof GaluchatApiJs.AacSelectedEvent){ //OK
        const tag=document.getElementById("result")! as HTMLInputElement;
        console.log(e.aacode)
        if(e.aacode.aacode==0){
            tag.value=""
        }else{
            tag.value=`${e.aacode.aacode} ${e.aacode.address.prefecture} ${e.aacode.address.city}`;
        }

        // cmp.update(e.lonlat.lon, e.lonlat.lat);
        // console.log("M", e.lonlat.lon, e.lonlat.lat)
    }
    // console.log("e3s3ss");
});

 //var img=new GaluchatApiJs.WebApiMapProvider();
// img.getMap(134.72,35.6,100,100,100).then();
}
// alert(1);

