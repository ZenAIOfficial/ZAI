package cn.z.zai.common.constant;


import java.math.BigDecimal;

public final class TokenAddressConstant {

    public static final String USDC_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    public static final String USDT_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

    public static final BigDecimal USDC_PRICE = BigDecimal.ONE;

    public static final Integer USDC_DECIMALS = 6;
    /**
     * WSOL
     */
    public static final String WSOL_ADDRESS = "So11111111111111111111111111111111111111112";

    /**
     * Solana Info
     */
    public static final String SOL_ADDRESS = "So11111111111111111111111111111111111111111";

    public static final Integer SOL_DECIMALS = 9;

    public static final String SOL_IMAGE = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";

    public static final String SOL_NAME = "Solana";

    public static final String SOL_SYMBOL = "SOL";


    private TokenAddressConstant() {
    }
}
