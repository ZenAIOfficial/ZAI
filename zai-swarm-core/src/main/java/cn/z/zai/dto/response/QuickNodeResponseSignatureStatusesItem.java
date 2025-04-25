package cn.z.zai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuickNodeResponseSignatureStatusesItem {

    private QuickNodeResponseTokenAccountsByOwnerItemContext context;

    private List<QuickNodeResponseSignatureStatusesItemValue> value;

}
