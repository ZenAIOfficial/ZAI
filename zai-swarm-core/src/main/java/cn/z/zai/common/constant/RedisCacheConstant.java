package cn.z.zai.common.constant;

public final class RedisCacheConstant {

    /**
     * auth:token:{id}
     */
    public static final String AUTH_TOKEN_KEY = "auth:token:%s";



    //========================api KEY========================

    /**
     * api:key:${type}:${level}
     * @see cn.z.zai.common.enums.ApiKeyTypeEnum
     * @see cn.z.zai.common.enums.ApiKeyLevelEnum
     */
    public static final String API_KEY = "api:key:%s:%s";


    /**
     * %{userId}
     */
    public static final String SYNC_SIGNATURES_LOCK = "zShort:signatures:lock:%s:%s";

    /**
     * %{userId}:%{network}
     */
    public static final String SYNC_BALANCE_LOCK = "zShort:balance:lock:%s:%s";
    /**
     * %{userId}:%{network}
     */
    public static final String SYNC_TOKENS_LOCK = "zShort:tokens:lock:%s:%s";
    /**
     * tokenTrending:lastTime
     */
    public static final String TOKEN_TRENDING_NETWORK_LAST_TIME_KEY = "tokenTrending4Network:lastTime:%s";

    public static final Long TOKEN_TRENDING_LAST_TIME_KEY_TIMEOUT = 60 * 60 * 24 * 1L;

    /**
     * #{address}.analyze infoDetail
     */
    public static final String ADDRESS_INFO_DETAIL = "analyze:detail:%s";

    public static final String SIGNATURES_FOR_ADDRESS = "signatures:address:%s";

    public static final String BUY_SELL_NUM = "ts:bsNum:%s";

    /**
     * address
     */
    public static final String TOP10_HOLDER_DETAIL = "token:top:list:%s";

    /**
     * address
     */
    public static final String TOP10_HOLDER_DETAIL_DEF = "token:top:def:%s";


    /**
     * api:keyLimit:${type}:${apiKey}
     * @see cn.z.zai.common.enums.ApiKeyTypeEnum
     */
    public static final String API_KEY_REQUEST_LIMIT = "api:keyLimit:%s:%s";
    /**
     * 60 seconds
     */
    public static final Long API_KEY_REQUEST_LIMIT_TIMEOUT = 40L;

    //========================solscan========================



    /**
     * be:overview:${address}
     */
    public static final String BIRD_EYE_TOKEN_OVERVIEW_KEY = "be:overview:%s";

    /**
     * 1 day
     */
    public static final Long BIRD_EYE_TOKEN_OVERVIEW_KEY_TIMEOUT = 60 * 5L;



    /**
     * be:priceM:${address}
     */
    public static final String BIRD_EYE_PRICE_MULTIPLE_KEY = "be:priceM:%s";
    /**
     * 30Minute
     */
    public static final Long BIRD_EYE_PRICE_MULTIPLE_KEY_TIMEOUT = 60 * 30L;

    /**
     * be:price24HChangeM:${address}
     */
    public static final String BIRD_EYE_PRICE_24H_CHANGE_MULTIPLE_KEY = "be:price24HChangeM:%s";
    /**
     * 30Minute
     */
    public static final Long BIRD_EYE_PRICE_24H_CHANGE_MULTIPLE_KEY_TIMEOUT = 60 * 30L;





    /**
     * tokenDetail:id:${address}
     */
    public static final String TOKEN_DETAIL_KEY = "tokenDetail:id:%s";


    /**
     * 1 Day
     */
    public static final Long TOKEN_DETAIL_KEY_TIMEOUT = 60 * 60 * 24L;

    public static final String USER_TOKEN_LIST = "user:token:%s";

    /**
     * user:tokenUpdate:#{tgUserId}
     */
    public static final String USER_TOKEN_LIST_UPDATE_KEY = "user:tokenUpdate:%s";


    /**
     * be:price:${address}
     */
    public static final String BIRD_EYE_PRICE_DATA_KEY = "be:priceData:%s";



    public static final String USER_TOKEN_LIST_CONSUME = "user:token:list:consume:%s";



    public static final String USER_ACCOUNT_INCREASE_RATE = "userAccountIncRate:%s";


    /**
     * userId:transactionId
     */
    public static final String WEBBOT_TRANSACTION_LOG = "webBot:ts:%s:%s";

    /**
     * OHLCV:list:${address}:${ohlcvType}:{time}
     */
    public static final String OHLCV_TENDENCY_COMMON_KEY = "OHLCV:lsc:%s:%s:%s";

    /**
     * userId:transactionId
     */
    public static final String WEBBOT_TRANSACTION_NETWORK = "webBot:netWork:%s:%s";

    /**
     *OHLCV_EXIST:${address}:${timeType}
     */
    public static final String OHLCV_EXIST_KEY = "OHLCV:exist:%s:%s";

    /**
     *OHLCV_ONEHOURS_UPDATE:${address}:${timeType}
     */
    public static final String OHLCV_ONE_HOURS_UPDATE = "OHLCV:oneHours:update:%s:%s";






    public static final String AIRDROP_CONFIG = "airdrop:config";

    public static final String INIT_ALL_CONFIG = "init:all:config";

    /**
     * day:userId
     */
    public static final String LIMIT_SESSION_NEW = "limit:session:new:%s:%s";

    /**
     * day:userId
     */
    public static final String LIMIT_SESSION_NUM = "limit:session:num:%s:%s";

    public static final String TOKEN_SEARCH = "tokenSearch:%s";

    /**
     * slippage
     */
    public static final String SLIPPAGE_INFO = "slippage:info:%s";

    public static final String USER_ACCOUNT_TRANSACTION_MSG_SEND_PROTECT = "transaction:msg:protect:%s";


    /**
     * 2 Seconds
     */
    public static final Long EXPIRE_TIME_OUT_SECOND_2 = 2L;

    /**
     * 3 Seconds
     */
    public static final Long EXPIRE_TIME_OUT_SECOND_3 = 3L;

    /**
     * 5 Seconds
     */
    public static final Long EXPIRE_TIME_OUT_SECOND_5 = 5L;

    /**
     * 5 Minute
     */
    public static final Long EXPIRE_TIME_OUT_MINUTE_5 = 60L * 5;

    /**
     * 30 Minute
     */
    public static final Long EXPIRE_TIME_OUT_MINUTE_30 = 60L * 30;

    /**
     * 7 days
     */
    public static final Long EXPIRE_TIME_OUT_DAY_7 = 60 * 60 * 24 * 7L;

    /**
     * 4 days
     */
    public static final Long EXPIRE_TIME_OUT_DAY_4 = 60 * 60 * 24 * 4L;

    /**
     * 3 days
     */
    public static final Long EXPIRE_TIME_OUT_DAY_3 = 60 * 60 * 24 * 3L;

    /**
     * 1 days
     */
    public static final Long EXPIRE_TIME_OUT_DAY_1 = 60 * 60 * 24L;

    /**
     * 3 hour
     */
    public static final Long EXPIRE_TIME_OUT_HOUR_3 = 60 * 60 * 3L;

    /**
     * 8 hour
     */
    public static final Long EXPIRE_TIME_OUT_HOUR_8 = 60 * 60 * 8L;

    /**
     * 1 hour
     */
    public static final Long EXPIRE_TIME_OUT_HOUR_1 = 60 * 60L;



    /**
     * 1 Minute
     */
    public static final Long EXPIRE_TIME_OUT_MINUTE_1 = 60L ;

    public static final String UPGRADE_STATUS = "UPGRADE:STATUS";

    //======web bot auth========
    public static final String WEB_BOT_AUTH_ADDRESS = "webVerifyNumber:%s";

    public static final Long WEB_BOT_AUTH_ADDRESS_TIME_OUT = 5 * 60L ;


    private RedisCacheConstant() {
    }
}
