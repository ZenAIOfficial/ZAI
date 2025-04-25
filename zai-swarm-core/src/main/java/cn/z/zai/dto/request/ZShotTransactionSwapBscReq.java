package cn.z.zai.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ZShotTransactionSwapBscReq implements Serializable {


    private static final long serialVersionUID = 8878208947653812993L;
    private String fromAddress;


    private String sellToken;


    private String buyToken;


    private String value;

}
