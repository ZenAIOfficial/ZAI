package cn.z.zai.dao;

import cn.z.zai.dto.so.TokenTrendingSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenTrendingVo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
@Repository
public interface TokenTrendingDao {

    TokenTrendingVo queryMaxLastTimestamp(String network);

    List<TokenDetailVo> queryTrending(TokenTrendingSo so);

    void addBatch(List<TokenTrendingVo> voList);

    List<TokenDetailVo> queryTrendingRandom(TokenTrendingSo so);

    void deletedByTime(LocalDateTime localDateTime);

}
