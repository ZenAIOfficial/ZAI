package cn.z.zai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 *
 * @link {https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-trending}
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BirdEyeHolderResp {

    private List<BirdEyeHolderResponse> items;
}
