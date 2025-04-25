package cn.z.zai.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;


@AllArgsConstructor
@Getter
public enum KafkaCommonMsgTypeEnum {

    UNKNOWN("unknown"),


    BATCH_REFRESH_TOKEN_DETAIL("batchRefreshTokenDetail"),

    SYNC_TOKEN_PRICE("syncTokenPrice"),

    REFRESH_TOKEN_SHOW_STATUS("refreshTokenShowStatus"),

    DELETED_TOKEN_TENDENCY_MAX("deletedTokenTendencyMax"),


    SYNC_SINGLE_TOKEN_PRICE("syncSingleTokenPrice"),

    INIT_TOKEN("initToken"),

    SYNC_TOKEN_BY_MKT_CAP("syncTokenByMktCap"),

    SYNC_TOKEN_TRENDING("syncTokenTrending"),

    UPDATE_TOKEN_DETAIL_LAST_SHOW_DATE_TIME("updateTokenDetailLastShowDateTime"),

    SYNC_OHLCV_PRICE("syncOHLCVPrice"),

    SYNC_TOKEN_TRADES("Trades-TokenSeekByTime"),

    ;

    private final String type;

    public static KafkaCommonMsgTypeEnum get(String type){
        for (KafkaCommonMsgTypeEnum value : KafkaCommonMsgTypeEnum.values()) {
            if (value.getType().equals(type)){
                return value;
            }
        }
        return UNKNOWN;
    }
}
