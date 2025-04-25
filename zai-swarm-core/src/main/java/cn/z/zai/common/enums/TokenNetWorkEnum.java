package cn.z.zai.common.enums;

import lombok.Getter;

@Getter
public enum TokenNetWorkEnum {

    SOLANA("solana", "solana"),


    ETHEREUM("ethereum", "ethereum"),

    ARBITRUM("arbitrum", "arbitrum"),

    AVALANCHE("avalanche", "avalanche"),

    BSC("bsc", "bsc"),

    OPTIMISM("optimism", "optimism"),

    POLYGON("polygon", "polygon"),

    BASE("base", "base"),

    ZKSYNC("zksync", "zksync"),

    SUI("sui", "sui"),

    ;

    private final String network;
    private final String desc;

    TokenNetWorkEnum(String network, String desc) {
        this.network = network;
        this.desc = desc;
    }
}
