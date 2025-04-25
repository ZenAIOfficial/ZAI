package cn.z.zai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BirdEyeOHLCVRequest extends BirdEyeBaseReq{

  private String address;



  /**
   * {1m,2m,5m,15m,.....}
   */
  private String type;

  private Long time_from;

  private Long time_to;
}
