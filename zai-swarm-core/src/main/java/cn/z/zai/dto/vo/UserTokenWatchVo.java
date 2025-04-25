package cn.z.zai.dto.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.math.BigInteger;


@Data
@ApiModel(description = "User Token Watch Model")
public class UserTokenWatchVo implements Serializable {

    @ApiModelProperty(hidden = true)
    private Integer id;

    @ApiModelProperty(hidden = true)
    private BigInteger tgUserId;

    @ApiModelProperty(name = "address" ,required = true)
    private String address;

    @ApiModelProperty(hidden = true)
    private Integer sort;
}
