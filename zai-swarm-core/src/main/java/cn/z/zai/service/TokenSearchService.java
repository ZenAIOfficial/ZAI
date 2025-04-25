package cn.z.zai.service;

import cn.z.zai.dto.entity.TokenSearch;

public interface TokenSearchService {

    TokenSearch tokenSearch(String address);

    String tokenNetwork(String address);

    Long getCreatTime4Api(String address);
}
