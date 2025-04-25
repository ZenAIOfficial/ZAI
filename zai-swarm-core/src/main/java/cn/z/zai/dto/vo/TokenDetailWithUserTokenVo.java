package cn.z.zai.dto.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;


@Data
@EqualsAndHashCode(callSuper = true)
public class TokenDetailWithUserTokenVo extends TokenDetailVo {

    private BigInteger amount;

    private BigDecimal increaseRate;

    private Boolean isWatch;

    private LocalDateTime firstBoughtTime;

    private String whalesProbability;
}
