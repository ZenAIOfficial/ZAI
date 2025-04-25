package cn.z.zai.dto.vo;

import lombok.Data;

import java.io.Serializable;


@Data
public class WebBotUserTokensReq implements Serializable {
    private static final long serialVersionUID = -5920208815256989180L;

    private String matchId;

    private String network;
}
