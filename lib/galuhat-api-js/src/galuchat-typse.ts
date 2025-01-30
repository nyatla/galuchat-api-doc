

/**
 * ピクセル座標系でのサイズ
 */
export class Size{
    constructor(readonly width:number,readonly height:number){};
}
/**
 * ピクセル座標系での点
 */
export class Point{
    constructor(readonly x: number, readonly y: number) {}
}

export class UnitInvs extends Point{}


/**
 * 経緯度座標系での点
 */
export class Lonlat{
    constructor(readonly lon:number,readonly lat:number){}
}
/**
 * 経緯度座標系での範囲を格納する。
 */
export class GsiBox
{
    constructor(readonly north:number,readonly south:number,readonly west :number,readonly east:number){
    }
    get center():Point{
        return new Point((this.west+this.east)*.5,(this.north+this.south)*.5)
    }
}