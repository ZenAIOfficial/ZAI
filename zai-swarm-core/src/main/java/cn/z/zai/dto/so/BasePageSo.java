package cn.z.zai.dto.so;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;


@Data
@ApiModel(description = "page info")
public class BasePageSo {

    @ApiModelProperty(name = "pageNum",notes = "pageNum")
    private Integer pageNum = 1;

    @ApiModelProperty(name = "pageSize",notes = "pageSize")
    private Integer pageSize = 10;

    private String network;
}
