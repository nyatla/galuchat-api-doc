/**
 * 経緯度を格納する。
 */
export class Lonlat{
    constructor(readonly lon:number,readonly lat:number){}
}
export class Size{
    constructor(readonly width:number,readonly height:number){};
}
export class Point{
    constructor(readonly x: number, readonly y: number) {}
}

export class UnitInvs extends Point{}

