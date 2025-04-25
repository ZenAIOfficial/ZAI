package cn.z.zai.dto.vo;

import lombok.Data;

import java.io.Serializable;


@Data
public class WebBotTransactionBase implements Serializable {
    private static final long serialVersionUID = 2633794053974455556L;

    private String active;


    private String network;
}
