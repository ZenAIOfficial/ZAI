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
public class ZAITransferBalanceCheckContent extends ZAIBaseChatContent {

    private String symbol;

    private String name;

    private String imageUrl;
    private BigDecimal userBalanceCoin;

    private BigDecimal needCoin;

    private String network;

    private String text;
}
