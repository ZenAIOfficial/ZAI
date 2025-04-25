package cn.z.zai.dto.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ZShotTransactionSwapWithTrusteeshipVo {


    private String ownerAddress;


    private String inputMintAddress;


    private Integer inputMintDecimals;


    private Long amount;

    private BigDecimal changeBalance;


    private BigDecimal price;


    private String outputMintAddress;

    private String superiorsAddress;

    private Integer slippageBps;

    private String tgUserId;

    private String linkId;

    private String ctext;


}