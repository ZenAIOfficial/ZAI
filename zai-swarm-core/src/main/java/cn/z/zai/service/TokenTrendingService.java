package cn.z.zai.service;

import cn.z.zai.dto.so.TokenTrendingSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenTrendingVo;

import java.util.List;

public interface TokenTrendingService {

    List<TokenTrendingVo> queryMaxLastTimestampWithCache(String network);

    List<TokenDetailVo> queryTrending(TokenTrendingSo so);

    void addBatch(List<TokenTrendingVo> voList);

    List<TokenDetailVo> queryTrendingRandom(TokenTrendingSo so);
}
