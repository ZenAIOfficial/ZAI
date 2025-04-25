package cn.z.zai.dto.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;


@Data
public class SmarterTonBalanceMessage implements Serializable {
    private static final long serialVersionUID = -802290520543476410L;

    /**
     *
     */
    private Integer smartWalletNum;

    /**
     *
     */
    private String symbol;

    /**
     *
     */
    private String name;

    /**
     *
     */
    private String address;

    /**
     *
     */
    private BigDecimal price;

    /**
     *
     */

    private List<BigDecimal> priceChange;

    /**
     *
     */
    private BigDecimal mktCap;

    /**
     *
     */
    private BigInteger holders;

    /**
     *
     */

    private Long deployTime;

    /**
     *
     */
    private BigDecimal circulatingSupply;

    /**
     *
     */
    private BigDecimal allTimeHigh;

    /**
     *
     */
    private Long allTimeHighTime;

    /**
     *
     */
    private BigDecimal smartWalletValue;

    /**
     *
     */
    private Long buyNum;

    /**
     *
     */
    private Long sellNum;

    private List<ShowSmart> showSmarts;

    private String description;

    private String imageUrl;

    private BigDecimal top10holding;
    @Data
    public static class ShowSmart {

        private String name;

        private BigDecimal price;

        /**
         *
         */
        private Long buyNum;

        /**
         *
         */
        private Long sellNum;

        private Long lastPuyTime;

    }



    private BigDecimal volume_30m;

    private BigDecimal volume_30m_usd;

    private BigDecimal buy_30m;

    private BigDecimal buy_history_30m;

    private BigDecimal sell_30m;

    private BigDecimal sell_history_30m;

    private BigDecimal trade_30m;

    private BigDecimal volume_buy_30m_usd;

    private BigDecimal volume_sell_30m_usd;






    //=========volume
    private BigDecimal volume_1h;

    private BigDecimal volume_1h_usd;

    private BigDecimal volume_buy_1h;

    private BigDecimal volume_buy_1h_usd;

    private BigDecimal volume_sell_1h;

    private BigDecimal volume_sell_1h_usd;

    /**
     * volume_buy_1h_usd - volume_sell_1h_usd
     */
    private BigDecimal netPurchase_1h_usd;

    private BigDecimal trade_1h;


    private BigDecimal volume_8h;

    private BigDecimal volume_8h_usd;

    private BigDecimal volume_buy_8h;

    private BigDecimal volume_buy_8h_usd;

    private BigDecimal volume_sell_8h;

    private BigDecimal volume_sell_8h_usd;

    /**
     * volume_buy_8h_usd - volume_sell_8h_usd
     */
    private BigDecimal netPurchase_8h_usd;

    private BigDecimal trade_8h;


    private BigDecimal volume_24h;

    private BigDecimal volume_24h_usd;

    private BigDecimal volume_buy_24h;

    private BigDecimal volume_buy_24h_usd;

    private BigDecimal volume_sell_24h;

    private BigDecimal volume_sell_24h_usd;

    /**
     * volume_buy_24h_usd - volume_sell_24h_usd
     */
    private BigDecimal netPurchase_24h_usd;

    private BigDecimal trade_24h;

    /**
     * CookieFunContract
     */
    private BigDecimal mindshare;

    private Long followersCount;

    private Long smartFollowersCount;

}
