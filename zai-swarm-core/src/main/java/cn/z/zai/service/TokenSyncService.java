package cn.z.zai.service;

import cn.z.zai.dto.response.BirdEyeCreationTokenInfoResponse;
import cn.z.zai.dto.response.BirdEyePriceResponse;
import cn.z.zai.dto.response.BirdEyeTokenOverviewResponse;
import cn.z.zai.dto.response.QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo;
import cn.z.zai.dto.vo.TokenDetailVo;

import java.util.List;


public interface TokenSyncService {


    TokenDetailVo syncTokenByAddressNew(String address);


    BirdEyeCreationTokenInfoResponse syncTokenDeployTime(String address);

    /**
     * timeout one day
     *
     * @param address
     * @return
     */
    BirdEyeTokenOverviewResponse syncBirdEyeTokenOverviewWithCache(String address);


    //==========QuickNode========
    List<QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo> syncAccountTokens(String walletAddress);




    BirdEyePriceResponse asyncBirdEyePriceRealTime(String address);

}
