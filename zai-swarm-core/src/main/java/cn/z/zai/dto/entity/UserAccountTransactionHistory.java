package cn.z.zai.dto.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserAccountTransactionHistory extends BaseEntity {

    private static final long serialVersionUID = 6602819122654745603L;
    private LocalDate day;

    private String network;
    private BigInteger tgUserId;

    private String transId;


    private Integer transType;

    private String fromAddress;

    private String toAddress;

    private String tokenAddress;

    private String tokenImage;

    private Long free;

    private BigDecimal tokenValue;

    private Long solChange;

    private String sendTokenSymbol;

    private BigDecimal sendTokenPrice;

    private Long sendTokenAmount;

    private BigDecimal sendTokenUiAmount;

    private BigDecimal sendTokenValue;

    private String sendTokenAddress;

    private String receiveTokenSymbol;

    private BigDecimal receiveTokenPrice;

    private Long receiveTokenAmount;

    private BigDecimal receiveTokenUiAmount;

    private BigDecimal receiveTokenValue;

    private String receiveTokenAddress;

    private BigDecimal appCommission;

    private Long appSolChange;

    private BigDecimal parentCommission;

    private Long parentSolChange;

    private LocalDateTime lastDateTime;

}
