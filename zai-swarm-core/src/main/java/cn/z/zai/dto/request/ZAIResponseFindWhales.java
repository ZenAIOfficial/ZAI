package cn.z.zai.dto.request;

import lombok.Data;

import java.io.Serializable;

@Data
public class ZAIResponseFindWhales implements Serializable {
    private static final long serialVersionUID = 6598973751171221737L;

    private String probability;

    private String content;

}
