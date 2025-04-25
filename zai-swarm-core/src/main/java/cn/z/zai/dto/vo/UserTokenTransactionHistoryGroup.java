package cn.z.zai.dto.vo;

import cn.z.zai.dto.entity.UserTokenTransactionHistoryVo;
import lombok.Data;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


@Data
public class UserTokenTransactionHistoryGroup {

    private LocalDate day;

    private String network;

    private String transId;

    private BigInteger free;

    private BigDecimal tgUserId;

    private String symbol;

    private String image;

    private String tokenAddress;


    private Integer type;

    private Integer status;

    private BigDecimal value;

    private String equivalentSymbol;

    private BigDecimal equivalentSymValue;


    private LocalDateTime createdTime;

    private Long msgId;

    private BigDecimal sendTokenValue;

    private String sendTokenSymbol;

    private String sendTokenAddress;

    private BigInteger sendTokenAmount;

    private String receiveTokenSymbol;

    private String receiveTokenAddress;

    private BigInteger receiveTokenAmount;

    private List<UserTokenTransactionHistoryVo> listDetail;



    private BigInteger appSolChange;


    private BigInteger parentSolChange;

    private Integer markup;


}
