package cn.z.zai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * @link {https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-trending}
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BirdEyeHolderResponse {

    /**
     * amount
     */
    private String amount;

    private Integer decimals;

    private String mint;

    private String owner;

    private String token_account;

    private String ui_amount;

    private BigDecimal holding;
}
