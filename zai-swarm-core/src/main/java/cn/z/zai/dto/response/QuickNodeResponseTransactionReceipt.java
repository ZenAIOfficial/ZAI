package cn.z.zai.dto.response;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class QuickNodeResponseTransactionReceipt implements Serializable {

    private static final long serialVersionUID = 7592067808824327124L;
    private String blockHash;
    private String blockNumber;
    private String contractAddress;
    private String cumulativeGasUsed;
    private String effectiveGasPrice;
    private String from;
    private String gasUsed;
    private List<TransactionLog> logs;
    private String logsBloom;
    private String status;
    private String to;
    private String transactionHash;
    private String transactionIndex;
    private String type;

    @Data
    public static class TransactionLog {
        private String address;
        private List<String> topics;
        private String data;
        private String blockNumber;
        private String transactionHash;
        private String transactionIndex;
        private String blockHash;
        private String logIndex;
        private boolean removed;
    }
}
