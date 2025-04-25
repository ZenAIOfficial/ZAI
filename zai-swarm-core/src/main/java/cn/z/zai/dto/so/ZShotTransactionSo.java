package cn.z.zai.dto.so;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class ZShotTransactionSo {

    @NotNull
    private String transaction;

    private String tgUserId;
}
