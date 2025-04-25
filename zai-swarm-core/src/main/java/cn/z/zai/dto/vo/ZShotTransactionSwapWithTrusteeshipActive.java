package cn.z.zai.dto.vo;

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
public class ZShotTransactionSwapWithTrusteeshipActive extends WebBotTransactionBase{

    private static final long serialVersionUID = 7313754747256945710L;

    private String ownerAddress;


    private String inputMintAddress;


    private Integer inputMintDecimals;


    private Long amount;


    private BigDecimal changeBalance;


    private BigDecimal price;


    private String outputMintAddress;


    private Integer slippageBps;

    private String tgUserId;

    private String linkId;

    private String ctest;

    private String superiorsAddress;
}