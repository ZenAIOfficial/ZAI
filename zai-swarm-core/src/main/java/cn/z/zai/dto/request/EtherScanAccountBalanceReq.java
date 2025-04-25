package cn.z.zai.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class EtherScanAccountBalanceReq extends EtherScanBaseReq {


    private static final long serialVersionUID = -6241454040986848924L;

    private String address;


    private String tag;
}
