

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
    static distance(a:Point,b:Point){
        return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2)
    }
    move(x:number,y:number):Point{
        return new Point(this.x+x,this.y+y)
    }
    sub(b:Point):Point{
        return new Point(this.x-b.x,this.y-b.y)
    }
    add(b:Point):Point{
        return new Point(this.x+b.x,this.y+b.y)
    }
}

export class UnitInvs extends Point{}


/**
 * 経緯度座標系での点
 */
export class Lonlat{
    constructor(readonly lon:number,readonly lat:number){}
    isEqual(b:Lonlat):boolean{

        return b&& b.lon==this.lon && b.lat==this.lat
    }
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