package cn.z.zai.dto.request.chat;

import lombok.Data;

import java.math.BigDecimal;


@Data
public class ZAIResponseDefinition {

    private String finish;

    private String action;

    private String ca;

    private String type;
    private String tokenName;

    private BigDecimal solAmount;

    private BigDecimal amount;

    private String targetAddress;
}
