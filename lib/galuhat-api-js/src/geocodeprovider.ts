import {DEFALUT_ENDPOINT,MAPSET_TABLE} from "./appdef"



export interface IReverseGeoCodeProvider<T>{
    /**
     * MAP
     * @param {*} lon 
     * @param {*} lat 
     * @return {T}
     */
    getCode(lon:number,lat:number):Promise<T>;
}

export interface GaluchatAac{
    aacode:number
    address:{
        city:string,
        prefecture:string
    }
}

export class WebApiAacProvider implements IReverseGeoCodeProvider<GaluchatAac>
{
    private readonly endpoint:string;
    private readonly mapset:string
    // private readonly unit_invs:UnitInvs
 
    constructor(mapset_name:string,endpoint:string=DEFALUT_ENDPOINT){
        if((mapset_name in MAPSET_TABLE)==false){
            throw new Error(`Invalid mapset name:${mapset_name}`);
        }
        this.endpoint=`${endpoint}/raac`;
        this.mapset=mapset_name;
        // this.unit_invs=MAPSET_TABLE[mapset_name];
    }    
    async getCode(lon:number,lat:number):Promise<GaluchatAac>{
        const url = `${this.endpoint}?lon=${lon}&lat=${lat}&mapset=${this.mapset}`;
        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch map image: ${response.statusText}`);
        }
        const data = await response.json();
        if (
            typeof data === "object" &&
            data !== null &&
            typeof (data as any).aacode === "number"){
                if(data.aacode as number==0){
                    return data as GaluchatAac;
                }else if(data.address==null){
                    return data as GaluchatAac;
                }else if(
                    typeof (data as any).address?.city === "string" &&
                    typeof (data as any).address?.prefecture === "string"
                ) {
                    return data as GaluchatAac;
                }
    
            }
        throw new Error("Invalid RaacResult object");
    }
}


export interface GaluchatJcc{
    aacode:number
    jcc:{
        name:string
        code:string
        name_en:string
    }
}


export class WebApiJccProvider implements IReverseGeoCodeProvider<GaluchatJcc>
{
    private readonly endpoint:string;
    private readonly mapset:string
    // private readonly unit_invs:UnitInvs
 
    constructor(mapset_name:string,endpoint:string=DEFALUT_ENDPOINT){
        if((mapset_name in MAPSET_TABLE)==false){
            throw new Error(`Invalid mapset name:${mapset_name}`);
        }
        this.endpoint=`${endpoint}/rjcc`;
        this.mapset=mapset_name;
        // this.unit_invs=MAPSET_TABLE[mapset_name];
    }    
    async getCode(lon:number,lat:number):Promise<GaluchatJcc>{
        const url = `${this.endpoint}?lon=${lon}&lat=${lat}&mapset=${this.mapset}`;
        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch map image: ${response.statusText}`);
        }
        const data = await response.json();
        if (
            typeof data === "object" &&
            data !== null &&
            typeof (data as any).aacode === "number"){
                if(data.aacode as number==0){
                    return data as GaluchatJcc;
                }else if(
                    typeof (data as any).aacode === "number" &&
                    typeof (data as any).jcc?.name === "string" &&
                    typeof (data as any).jcc?.code === "string" &&
                    typeof (data as any).jcc?.name_en === "string"
                ) {
                    return data as GaluchatJcc;
                }
        
            }
        throw new Error("Invalid RjccResult object");
    }
}
