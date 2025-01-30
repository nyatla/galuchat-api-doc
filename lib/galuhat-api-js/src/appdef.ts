import { UnitInvs } from "./galuchat-typse";

export const DEFALUT_ENDPOINT="https://galuchat.nyatla.jp"

export const MAPSET_TABLE:{ [key: string]: UnitInvs }={
    "ma100":new UnitInvs(100,100),
    "ma1000":new UnitInvs(1000,1000),
    "ma10000":new UnitInvs(10000,10000)
};
