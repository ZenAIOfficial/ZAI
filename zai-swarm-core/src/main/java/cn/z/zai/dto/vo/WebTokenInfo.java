package cn.z.zai.dto.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 
 */
@Data
public class WebTokenInfo implements Serializable {

    private static final long serialVersionUID = -6744083233213357696L;

    private String uniqueId;

    private BigDecimal totalBalance;

    private List<UserTokenVo> tokenList;

    // private List<UserTokenVo> tokenListBsc;

    private Map<String, BigDecimal> priceMap;

    private Integer invitedFriends = 0;

    private BigDecimal commissionTotalUsdc = BigDecimal.ZERO;
}
