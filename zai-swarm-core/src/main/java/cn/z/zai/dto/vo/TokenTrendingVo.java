package cn.z.zai.dto.vo;

import lombok.Data;

import java.math.BigInteger;
import java.time.LocalDateTime;


@Data
public class TokenTrendingVo {

    private Integer id;

    private String network;

    private String name;

    private String address;

    private String symbol;

    private Integer decimals;

    private BigInteger lastTimestamp;

    private LocalDateTime lastDateTime;
}
