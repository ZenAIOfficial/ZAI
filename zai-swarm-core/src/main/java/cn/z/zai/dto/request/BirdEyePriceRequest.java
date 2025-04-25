package cn.z.zai.dto.request;

import java.math.BigDecimal;
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
public class BirdEyePriceRequest extends BirdEyeBaseReq{

  private BigDecimal check_liquidity;

  private Boolean include_liquidity;

  private String address;

  private String network;
}
