package cn.z.zai.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class EtherScanAccountTokentxReq extends EtherScanBaseReq {

    private static final long serialVersionUID = -5855552337136981328L;
    private String contractaddress;

    private String address;

    private Integer page;
    private Integer offset;
    private String startblock;
    private String endblock;
    private String sort;

}