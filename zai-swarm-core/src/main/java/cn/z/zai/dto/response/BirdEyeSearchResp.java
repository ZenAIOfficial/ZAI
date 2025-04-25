package cn.z.zai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 *
 * @link {https://docs.birdeye.so/reference/get_defi-v3-search}
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BirdEyeSearchResp {

    private List<Item> items;

    @Data
    public static class Item {

        private String type;

        private List<SearchResp> result;
    }

    @Data
    public static class SearchResp {
        private String name;
        private String symbol;
        private String address;
        private String network;
        private Integer decimals;
        private String logo_uri;
        private Boolean verified;
        private BigDecimal fdv;
        private BigDecimal market_cap;
        private BigDecimal liquidity;
        private BigDecimal price;
        private BigDecimal price_change_24h_percent;
        private Long sell_24h;
        private BigDecimal sell_24h_change_percent;
        private Long buy_24h;

        private BigDecimal buy_24h_change_percent;

        private Long unique_wallet_24h;
        private BigDecimal unique_wallet_24h_change_percent;
        private Long trade_24h;
        private BigDecimal trade_24h_change_percent;
        private BigDecimal volume_24h_change_percent;
        private BigDecimal volume_24h_usd;
        private Long last_trade_unix_time;
        private String last_trade_human_time;
        private BigDecimal supply;
        private Long updated_time;
        private String creation_time;

    }

    /**
     *             "name": "YODA",
     *             "symbol": "YODA",
     *             "address": "J3TqbUgHurQGNxWtT88UQPcMNVmrL875pToQZdrkpump",
     *             "network": "solana",
     *             "decimals": 6,
     *             "logo_uri": "https://ipfs.io/ipfs/QmRvXbEF2CdXzf57FNP1zMfPTB3Z3Mk8ix6fTaVUhezf3w",
     *             "verified": false,
     *             "fdv": 89914.64111880648,
     *             "market_cap": 89914.64111880648,
     *             "liquidity": 34860.47668680489,
     *             "price": 0.00008994787344732427,
     *             "price_change_24h_percent": -4.460712627012446,
     *             "sell_24h": 156620,
     *             "sell_24h_change_percent": 67.6102008711193,
     *             "buy_24h": 155556,
     *             "buy_24h_change_percent": 68.84769017019798,
     *             "unique_wallet_24h": 109,
     *             "unique_wallet_24h_change_percent": 45.333333333333336,
     *             "trade_24h": 312176,
     *             "trade_24h_change_percent": 68.22456094971736,
     *             "volume_24h_change_percent": 64.4859419606859,
     *             "volume_24h_usd": 27878.398911845154,
     *             "last_trade_unix_time": 1742349293,
     *             "last_trade_human_time": "2025-03-19T01:54:53",
     *             "supply": 999635132.370218,
     *             "updated_time": 1742349298
     */
}
