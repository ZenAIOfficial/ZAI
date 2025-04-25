package cn.z.zai.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ApiKeyTypeEnum {

    SOL_SCAN(1),

    BIRD_EYE(2),

    QUICK_NODE(3),

    ETHER_SCAN(4),

    QUICK_NODE_BNB(5);
    private final Integer type;

    public static ApiKeyTypeEnum findByType(int type){
        for (ApiKeyTypeEnum value : ApiKeyTypeEnum.values()) {
            if (value.getType() == type){
                return value;
            }
        }
        return null;
    }
}
