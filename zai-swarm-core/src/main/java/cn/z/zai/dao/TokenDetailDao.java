package cn.z.zai.dao;

import cn.z.zai.dto.so.TokenDetailSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenDetailWithSecurityVo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface TokenDetailDao {


    TokenDetailVo queryByAddress(@Param("address") String address);


    void addTokenDetail(TokenDetailVo vo);

    void updateTokenDetail(TokenDetailVo vo);


    void batchUpdateTokenDetail(List<TokenDetailVo> voList);


    List<TokenDetailWithSecurityVo> queryListByTabType(TokenDetailSo so);

}
