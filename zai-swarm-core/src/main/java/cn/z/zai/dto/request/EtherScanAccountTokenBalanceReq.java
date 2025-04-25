package cn.z.zai.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class EtherScanAccountTokenBalanceReq extends EtherScanBaseReq {


    private static final long serialVersionUID = 1813359450529111247L;

    private String contractaddress;

    private String address;


    private String tag;
}
