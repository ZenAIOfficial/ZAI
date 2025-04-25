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
public class ZShotTransactionTransferWithTrusteeshipVo {

    private String fromAddress;

    private String toAddress;


    private String mintAddress;


    private Long amount;


    private BigDecimal changeBalance;


    private Integer decimals;

    private String tgUserId;

    private String linkId;

    private String ctext;
}
