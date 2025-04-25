package cn.z.zai.dto.response;

import cn.z.zai.dto.request.EtherScanBaseReq;
import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class EtherScanAccountTokentxResp extends EtherScanBaseReq {


    private static final long serialVersionUID = -3986996554879321416L;

    private String blockNumber;

    private String timeStamp;

    private String hash;

    private String nonce;

    private String blockHash;

    private String from;

    private String contractAddress;

    private String to;

    private String value;

    private String tokenName;

    private String tokenSymbol;

    private String tokenDecimal;

    private String transactionIndex;

    private String gas;

    private String gasPrice;

    private String gasUsed;

    private String cumulativeGasUsed;

    private String input;

    private String confirmations;

    /**
     *       {
     *          "blockNumber":"4730207",
     *          "timeStamp":"1513240363",
     *          "hash":"0xe8c208398bd5ae8e4c237658580db56a2a94dfa0ca382c99b776fa6e7d31d5b4",
     *          "nonce":"406",
     *          "blockHash":"0x022c5e6a3d2487a8ccf8946a2ffb74938bf8e5c8a3f6d91b41c56378a96b5c37",
     *          "from":"0x642ae78fafbb8032da552d619ad43f1d81e4dd7c",
     *          "contractAddress":"0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
     *          "to":"0x4e83362442b8d1bec281594cea3050c8eb01311c",
     *          "value":"5901522149285533025181",
     *          "tokenName":"Maker",
     *          "tokenSymbol":"MKR",
     *          "tokenDecimal":"18",
     *          "transactionIndex":"81",
     *          "gas":"940000",
     *          "gasPrice":"32010000000",
     *          "gasUsed":"77759",
     *          "cumulativeGasUsed":"2523379",
     *          "input":"deprecated",
     *          "confirmations":"7968350"
     *       }
     */
}