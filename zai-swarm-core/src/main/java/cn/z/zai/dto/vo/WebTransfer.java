package cn.z.zai.dto.vo;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class WebTransfer implements Serializable {
    private static final long serialVersionUID = 5215833966567420144L;

    @NotNull(message = "fromAddress is empty")
    private String fromAddress;

    @NotNull(message = "realAmount is empty")
    private BigDecimal realAmount;

    @NotNull(message = "coinType is empty")
    @Max(value = 1, message = "coinType is error")
    @Min(value = 0, message = "coinType is error")
    private Integer coinType;

}
