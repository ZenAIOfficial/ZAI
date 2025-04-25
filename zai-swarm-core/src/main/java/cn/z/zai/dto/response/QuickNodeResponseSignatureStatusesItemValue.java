package cn.z.zai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuickNodeResponseSignatureStatusesItemValue {

    private QuickNodeResponseSignatureStatusesItemValueAccount account;

    private String confirmationStatus;
}
