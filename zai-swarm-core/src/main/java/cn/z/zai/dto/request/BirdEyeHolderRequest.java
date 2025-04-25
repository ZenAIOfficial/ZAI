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
public class BirdEyeHolderRequest extends BirdEyeBaseReq{

  private static final long serialVersionUID = -279241702546191728L;
  private String address;

  private Integer offset;

  private Integer limit;
}
