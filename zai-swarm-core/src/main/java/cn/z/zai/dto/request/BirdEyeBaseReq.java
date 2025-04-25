package cn.z.zai.dto.request;

import cn.z.zai.common.enums.TokenNetWorkEnum;
import lombok.Data;

import java.io.Serializable;


@Data
public class BirdEyeBaseReq implements Serializable {

    private static final long serialVersionUID = -3685181770379925298L;
    /**
     *  "solana",
     *     "ethereum",
     *     "arbitrum",
     *     "avalanche",
     *     "bsc",
     *     "optimism",
     *     "polygon",
     *     "base",
     *     "zksync",
     *     "sui"
     */
    private String network = TokenNetWorkEnum.SOLANA.getNetwork();
}
