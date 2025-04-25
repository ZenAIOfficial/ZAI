package cn.z.zai.common.constant;


public interface BirdEyeApiConstant {

    @Deprecated
    String HEADER_API_KEY_VALUE = "xxxx";

    String HEADER_API_KEY_NAME = "X-API-KEY";

    String HEADER_X_CHAIN_KEY_NAME = "x-chain";

    String HEADER_X_CHAIN_KEY_VALUE = "solana";



    String BASE = "https://public-api.birdeye.so";


    /**
     * @link {https://docs.birdeye.so/reference/get_defi-token-overview}
     */
    String TOKEN_OVERVIEW_URL_GET = BASE + "/defi/token_overview";


    /**
     * @link {https://docs.birdeye.so/reference/get_defi-v3-token-trade-data-single}
     */
    String TOKEN_TRADE_DATA_SINGLE_URL_GET = BASE + "/defi/v3/token/trade-data/single";


    /**
     * @link {https://docs.birdeye.so/reference/get_defi-token-creation-info}
     */
    String CREATION_TOKEN_INFO_URL_GET = BASE + "/defi/token_creation_info";


    /**
     * https://docs.birdeye.so/reference/get_defi-price
     */
    String PRICE_URL_GET = BASE + "/defi/price";

    /**
     * @link {https://docs.birdeye.so/reference/get_defi-ohlcv}
     */
    String OHLCV_URL_GET = BASE + "/defi/ohlcv";


    /**
     * @link {https://docs.birdeye.so/reference/get_defi-token-security}
     */
    String TOKEN_SECURITY_URL_GET = BASE + "/defi/token_security";


    /**
     * @link {https://public-api.birdeye.so/defi/v3/token/holder}
     */

    String TOKEN_HOLDER_URL_GET = BASE + "/defi/v3/token/holder";


    /**
     * @link {https://docs.birdeye.so/reference/get_defi-v3-search}
     */
    String TOKEN_SEARCH_URL_GET = BASE + "/defi/v3/search";
}
