package cn.z.zai.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.AbstractMap;

@Getter
@ToString
@NoArgsConstructor
public class QuickNodeSignatureInformation {

    private Object err;

    private Object memo;

    private String signature;

    private Long slot;

    private Long blockTime;

    @SuppressWarnings({"rawtypes"})
    public QuickNodeSignatureInformation(AbstractMap info) {
        this.err = info.get("err");
        this.memo = info.get("memo");
        this.signature = (String)info.get("signature");
        this.slot = (Long)info.get("slot");
        this.blockTime = (Long) info.get("blockTime");
    }
}
