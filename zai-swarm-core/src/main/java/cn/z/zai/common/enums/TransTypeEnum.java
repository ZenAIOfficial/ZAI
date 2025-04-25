package cn.z.zai.common.enums;

import lombok.Getter;

@Getter
public enum TransTypeEnum {

    buy(1, "buy"),

    sell(2, "sell"),

    seed(3, "seed"),

    receive(4, "receive"),

    swap(5, "swap"),

    ;

    private final Integer type;
    private final String message;

    TransTypeEnum(Integer type, String message) {
        this.type = type;
        this.message = message;
    }
}
