package cn.z.zai.dto.vo;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class WebSwap implements Serializable {
    private static final long serialVersionUID = 5215833966567420144L;

    @NotNull(message = "mintAddress is empty")
    private String mintAddress;

    @NotNull(message = "realAmount is empty")
    private BigDecimal realAmount;

    /**
     * 0:buy 1:sell
     */
    @NotNull(message = "swapType is empty")
    @Max(value = 1, message = "swapType is error")
    @Min(value = 0, message = "swapType is error")
    private Integer swapType;

    private Integer slippageBps;

}
