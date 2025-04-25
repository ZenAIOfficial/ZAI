package cn.z.zai.dto.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ZShotTransactionTransferVo {

    private String fromAddress;

    private String toAddress;

    /**
     *
     */
    private String mintAddress;

    /**
     *
     */
    private Long amount;

    /**
     *
     */
    private Integer decimals;

    private Boolean isMax;

    private String tgUserId;
}
