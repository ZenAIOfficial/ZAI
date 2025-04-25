package cn.z.zai.dto.vo;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;


@Data
public class WebBotHolderReq implements Serializable {

    private static final long serialVersionUID = 4187837966993214983L;

    @NotNull(message = "token address cannot be empty.")
    private String tokenAddress;
}
