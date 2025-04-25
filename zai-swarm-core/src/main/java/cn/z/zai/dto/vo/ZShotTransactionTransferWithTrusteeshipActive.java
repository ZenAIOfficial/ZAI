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
public class ZShotTransactionTransferWithTrusteeshipActive extends WebBotTransactionBase{

    private static final long serialVersionUID = -7574654132177514074L;
    private String fromAddress;

    private String toAddress;


    private String mintAddress;


    private Long amount;

    private BigDecimal changeBalance;


    private Integer decimals;

    private String tgUserId;

    private String linkId;

    private String ctest;

}
