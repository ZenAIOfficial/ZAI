package cn.z.zai.dto.entity;

import lombok.Data;

@Data
public class TokenSearch {
    private static final long serialVersionUID = -4399464859162379828L;
    private Integer id;
    private String address;
    private String hitAddress;
    private String network;

    private String name;

    private String symbol;

    private String logoUri;

    private Integer decimals;
}
