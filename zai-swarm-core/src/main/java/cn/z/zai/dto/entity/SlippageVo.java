package cn.z.zai.dto.entity;

import lombok.Data;

import java.io.Serializable;

@Data
public class SlippageVo implements Serializable {
    private static final long serialVersionUID = 8432070570529758316L;


    private Integer buySlippageBps = 1000;

    private Integer sellSlippageBps = 1000;
}
