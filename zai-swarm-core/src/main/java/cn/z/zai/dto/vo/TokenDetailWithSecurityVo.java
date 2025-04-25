package cn.z.zai.dto.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;


@Data
@EqualsAndHashCode(callSuper = true)
public class TokenDetailWithSecurityVo extends TokenDetailVo{

    private Integer alarm;

    @JsonProperty("isWatch")
    private boolean isWatch;
}
