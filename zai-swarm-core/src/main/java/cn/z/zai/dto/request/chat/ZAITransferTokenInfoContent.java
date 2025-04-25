package cn.z.zai.dto.request.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigInteger;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ZAITransferTokenInfoContent extends ZAIBaseChatContent{


    private String symbol;

    private String name;

    private String imageUrl;

    private BigInteger amount;

    private Integer decimals;


    private String text;


    private String network;
}
