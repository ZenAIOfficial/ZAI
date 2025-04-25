package cn.z.zai.service;

import cn.z.zai.dto.request.chat.ZAITextAndOHLCChatContent;
import cn.z.zai.dto.response.BirdEyeHolderResp;
import cn.z.zai.dto.vo.SmarterTonBalanceMessage;
import cn.z.zai.dto.vo.TokenDetailVo;

public interface SmartWalletService {


    SmarterTonBalanceMessage buildSendMsg4WebBot(String tonAddress);


    String buildSmartSearchAddress4WebBot(SmarterTonBalanceMessage smarterTonBalanceMessage);

    void buildInfoDetail(SmarterTonBalanceMessage smarterTonBalanceMessage, ZAITextAndOHLCChatContent.InfoDetail infoDetail);

    BirdEyeHolderResp top10holderDetail(String tonAddress, TokenDetailVo tokenDetailVo);
}
