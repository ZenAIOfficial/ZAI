package cn.z.zai.dto.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
public class UserTokenTransactionHistoryVo {

    private LocalDate day;

    private String transId;

    private BigDecimal tgUserId;

    private String symbol;

    private String image;


    private Integer type;

    private Integer status;

    private BigDecimal value;

    private LocalDateTime createdTime;

    private Long msgId;
}
