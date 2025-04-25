package cn.z.zai.dto.entity;

import lombok.Data;

import java.io.Serializable;
import java.math.BigInteger;


@Data
public class UserWalletAddress implements Serializable {

    private static final long serialVersionUID = -294557240214572078L;

    private Integer id;
    private BigInteger tgUserId;

    private String walletAddress;

    private String network;

    private BigInteger balance;

    private String balanceStr;

    private Integer decimals;

}
