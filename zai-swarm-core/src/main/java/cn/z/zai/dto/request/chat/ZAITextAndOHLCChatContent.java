package cn.z.zai.dto.request.chat;

import cn.z.zai.dto.vo.TokenTendencyMaxVo;
import lombok.*;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ZAITextAndOHLCChatContent extends ZAIBaseChatContent{

    private String symbol;

    private String name;

    private String imageUrl;

    private String network;

    private String text;

    private List<TokenTendencyMaxVo> list;

    private InfoDetail infoDetail;

    @Data
    public static class InfoDetail{
        private String network;
        /**
         * CookieFunContract
         */
        private BigDecimal mindshare;

        private Long followersCount;

        private Long smartFollowersCount;


        private BigDecimal price;
        private String priceStr;

        private BigDecimal volume30mUsd;
        private String volume30mUsdStr;
        private BigDecimal volume1hUsd;
        private String volume1hUsdStr;
        private BigDecimal volume8hUsd;
        private String volume8hUsdStr;
        private BigDecimal volume24hUsd;
        private String volume24hUsdStr;

        private BigDecimal priceChange1m;
        private BigDecimal priceChange5m;
        private BigDecimal priceChange1h;
        private BigDecimal priceChange12h;
        private BigDecimal priceChange24h;

        private BigDecimal top10holding;
        private String top10holdingStr;

        private BigDecimal mktCap;
        private String mktCapStr;

        private BigInteger holders;
        private String holdersStr;

        private Long deployTime;


        private BigDecimal allTimeHigh;
        private String allTimeHighStr;
        private Long allTimeHighTime;


        private String whalesProbability;
    }
}
