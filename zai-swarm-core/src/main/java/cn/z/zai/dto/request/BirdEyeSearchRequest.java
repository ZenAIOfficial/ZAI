package cn.z.zai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * @link {https://public-api.birdeye.so/defi/v3/token/holder}
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BirdEyeSearchRequest extends BirdEyeBaseReq{

  private static final long serialVersionUID = 132552821995840850L;
  private String chain = "all";

  private String keyword;

  private String target = "token";

  private String search_mode = "exact";

  private String search_by = "address";

  private String sort_by = "volume_24h_usd";

  private String sort_type = "desc";

  private String verify_token;

  private String markets;

  private Integer offset = 0;

  private Integer limit = 20;
}
