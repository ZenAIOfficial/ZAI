package cn.z.zai.dto.request.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ZAITransferBuyTokenContent extends ZAIBaseChatContent {

    private Integer transferStatus = 0;

    private String symbol;

    private String name;

    private String imageUrl;

    private BigDecimal needSol;

    private String needAmount;

    private String text;

    private String network;

    /**
     * resp context
     */
    private Integer code;
    private String message;
}
