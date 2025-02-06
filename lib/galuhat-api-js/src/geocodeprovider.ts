import {DEFALUT_ENDPOINT,MAPSET_TABLE} from "./appdef"
import { Lonlat } from "./galuchat-typse";



export interface IReverseGeoCodeProvider<T>{
    /**
     * MAP
     * @param {*} lon 
     * @param {*} lat 
     * @return {T}
     */
    getCode(lonlat:Lonlat):Promise<T>;
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
    #last_url?:string
    #last_ret?:GaluchatAac
    private readonly endpoint:string;
    public readonly mapset_name:string
    // private readonly unit_invs:UnitInvs
 
    constructor(mapset_name:string,endpoint:string=DEFALUT_ENDPOINT){
        if((mapset_name in MAPSET_TABLE)==false){
            throw new Error(`Invalid mapset name:${mapset_name}`);
        }
        this.endpoint=`${endpoint}/raac`;
        this.mapset_name=mapset_name;
        // this.unit_invs=MAPSET_TABLE[mapset_name];
    }    
    async getCode(lonlat:Lonlat):Promise<GaluchatAac>{
        const url = `${this.endpoint}?lon=${lonlat.lon}&lat=${lonlat.lat}&mapset=${this.mapset_name}`;
        if(this.#last_url==url){
            console.log(`cached:${url}`);
            return this.#last_ret!
        }
        console.log(url);
        this.#last_url=url
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch map image: ${response.statusText}`);
        }
        const data = await response.json();
        if (
            typeof data === "object" &&
            data !== null &&
            typeof (data as any).aacode === "number"){
                let r=data as GaluchatAac;
                if( (data.aacode as number==0) || 
                    (data.address==null) ||
                    (typeof (data as any).address?.city === "string" &&
                    typeof (data as any).address?.prefecture === "string")
                ) {//pass
                    this.#last_url=url;
                    this.#last_ret=r
                    return r;
                    
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
    #last_url?:string
    #last_ret?:GaluchatJcc

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
    async getCode(lonlat:Lonlat):Promise<GaluchatJcc>{
        const url = `${this.endpoint}?lon=${lonlat.lon}&lat=${lonlat.lat}&mapset=${this.mapset}`;
        if(this.#last_url==url){
            console.log(`cached:${url}`);
            return this.#last_ret!
        }        
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
                const r=data as GaluchatJcc;
                if( (data.aacode as number==0)||
                    (typeof (data as any).aacode === "number" &&
                     typeof (data as any).jcc?.name === "string" &&
                     typeof (data as any).jcc?.code === "string" &&
                     typeof (data as any).jcc?.name_en === "string"
                    ))
                {
                    this.#last_url=url;
                    this.#last_ret=r
                    return r
                }
        
            }
        throw new Error("Invalid RjccResult object");
    }
}
