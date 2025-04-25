package cn.z.zai.dto.response;

import lombok.Data;

import java.io.Serializable;

@Data
public class EtherScanResponse<T> implements Serializable {

    private static final long serialVersionUID = 8695830725153561998L;

    private T result;

    private String message;

    private String status;
}
