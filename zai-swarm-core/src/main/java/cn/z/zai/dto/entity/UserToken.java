package cn.z.zai.dto.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigInteger;


@Data
@EqualsAndHashCode(callSuper = true)
public class UserToken extends BaseEntity{

    private BigInteger tgUserId;

    private String network;

    private String address;

    private BigInteger amount;
}
