package cn.z.zai.dto.request;

import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class EtherScanAccountTxlistReq extends EtherScanBaseReq {

    private static final long serialVersionUID = -4654364368837055062L;
    private String address;
    private String startblock;

    private String endblock;

    private Integer page;

    private Integer offset;

    private String sort;

}
