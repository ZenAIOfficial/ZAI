package cn.z.zai.service;

import cn.z.zai.dto.vo.TokenTendencyMaxVo;
import cn.z.zai.dto.vo.TokenTendencyResp;

import java.util.List;

public interface TokenTendencyHandleService {

    TokenTendencyResp allTendencyLine(String address);

    List<TokenTendencyMaxVo> live(String address);

    List<TokenTendencyMaxVo> fourHours(String address);

    List<TokenTendencyMaxVo> oneDay(String address);

    void syncHandle(String address);


    List<TokenTendencyMaxVo> oneDay(String address, boolean needSync);


    /**
     * Before calling this method, need use syncHandle()
     */
    List<TokenTendencyMaxVo> todayTendencyAllDetail(String address, Long blockTime, Boolean needSync);


    /**
     * deadMinute
     *
     * @param address
     * @param deadMinute
     * @return
     */
    List<TokenTendencyMaxVo> kPriceByDeadMinute(String address, long deadMinute);

}
