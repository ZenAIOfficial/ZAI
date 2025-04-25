package cn.z.zai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuickNodeResponseSignatureStatusesItemValueAccount {

    private Long slot;

    private String confirmations;

    private Object err;

    private Object status;
}
