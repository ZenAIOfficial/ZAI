package cn.z.zai.service;

import cn.z.zai.dto.so.TokenDetailSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenDetailWithSecurityVo;
import cn.z.zai.dto.vo.TokenDetailWithUserTokenVo;
import com.github.pagehelper.PageInfo;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface TokenDetailService {

    Map<String, BigDecimal> tokenPriceLast(List<String> addressList);

    BigDecimal tokenPriceLast(String address);

    Boolean saveTokenDetail(TokenDetailVo vo);

    TokenDetailVo queryWithCache(String address);


    Integer addTokenDetail(TokenDetailVo vo);

    void updateTokenDetail(TokenDetailVo vo);

    void sendMsg4UpdateTokenDetailLastShowDetailTime(String address);


    TokenDetailVo queryCacheWithAsync(String address);

    void batchUpdateTokenByAddress(List<TokenDetailVo> voList);

    TokenDetailWithUserTokenVo tokenDetailWithUserTokenInfo(TokenDetailSo so);

    PageInfo<TokenDetailWithSecurityVo> queryTokenWithPageNew(TokenDetailSo so);

    List<TokenDetailVo> searchByAddressOrSymbol(TokenDetailSo so);
}
