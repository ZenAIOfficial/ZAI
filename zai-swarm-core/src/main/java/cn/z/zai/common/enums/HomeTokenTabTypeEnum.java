package cn.z.zai.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum HomeTokenTabTypeEnum {

    DEFAULT(0),

    FAVORITES(1),

    HOT(2),

    GAINERS(3),

    LOSERS(4),

    NEW(5),

    VOLUME_24H(6),

    MARKET_CAP(7);

    private int type;


    public static HomeTokenTabTypeEnum findType(int type){
        for (HomeTokenTabTypeEnum value : HomeTokenTabTypeEnum.values()) {
            if (type == value.getType()){
                return value;
            }
        }
        return DEFAULT;
    }
}
