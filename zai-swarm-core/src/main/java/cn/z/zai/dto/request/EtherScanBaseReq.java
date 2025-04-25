package cn.z.zai.dto.request;

import lombok.Data;

import java.io.Serializable;


@Data
public class EtherScanBaseReq implements Serializable {


    private static final long serialVersionUID = -987026879127389988L;


    /**
     * @link https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains
     */
    private Integer chainid;

    private String module;

    private String action;

    private String apiKey;

}
