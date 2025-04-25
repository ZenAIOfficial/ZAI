package cn.z.zai.dto.vo;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import lombok.Data;


@Data
public class TokenDetailVo implements Serializable {

    private Integer id;
    private String network;

    private String coinGeckoId;

    private String name;

    private String address;

    private String symbol;

    private String image;

    private String ossImage;

    private BigDecimal mktCap;
    
    private String description;
    
    private BigDecimal totalSupply;
    
    private Integer decimals;
    
    private BigInteger holders;
    
    private BigInteger deployTime;
    
    private BigDecimal price;
    
    private String twitterScreenName;
    
    private BigDecimal volumePast24h;
    
    private BigDecimal price24hChange;
    
    private BigDecimal circulatingSupply;
    
    private String category;
    
    private BigInteger lastTimestamp;
    
    private LocalDateTime lastDateTime;

    private Integer showStatus;

    private BigDecimal price24hPast;

    private LocalDateTime price24hPastTime;

    private LocalDateTime lastShowDateTime;

    private Integer hidden;

    private Integer manualEditor;

    private Integer spotlight;

    private String spotlightDesc;
    private Integer ossed;
}
