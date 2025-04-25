package cn.z.zai.dto.so;

import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TokenDetailSo extends BasePageSo {

    @ApiModelProperty("this param be used by '/token/detail'")
    private String address;

    @ApiModelProperty("this param be used by '/token/search'")
    private String addressOrSymbol;

    private LocalDateTime minLastShowDateTime;

    private LocalDateTime maxLastShowDateTime;

    private String category;

    private BigInteger tgUserId;


    private List<BigInteger> list;

    private BigInteger trendingLastTimestamp;

    private Integer tabType;

    private String nameSort;

    private String volSort;

    private String price24hChangeSort;
}
