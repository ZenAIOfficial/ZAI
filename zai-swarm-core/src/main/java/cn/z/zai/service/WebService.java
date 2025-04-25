package cn.z.zai.service;



import cn.z.zai.dto.Response;
import cn.z.zai.dto.so.TokenDetailSo;
import cn.z.zai.dto.so.ZShotTransactionSo;
import cn.z.zai.dto.vo.WebBotHolderReq;
import cn.z.zai.dto.vo.WebBotUserTokensReq;
import cn.z.zai.dto.vo.WebSwap;
import cn.z.zai.dto.vo.WebTransfer;

import javax.servlet.http.HttpServletRequest;


public interface WebService {


    Response<?> transactionSend(ZShotTransactionSo so);

    Response<?> transfer(WebTransfer vo);

    Response<?> swapWithTrusteeship(WebSwap vo);


    Response<?> transactionStatus(ZShotTransactionSo so);

    Response<?> webTokenInfoList(WebBotUserTokensReq webBotUserTokensReq);

    Response<?> top10holderList(WebBotHolderReq webBotHolderReq);

    Response<?> tokenDetail(HttpServletRequest request, TokenDetailSo so);

    Response<?> tokensPage(HttpServletRequest request, TokenDetailSo so);

    Response<?> tokensSearch(TokenDetailSo so);

    Response<?> kLineTendencyAll(String address);
    Response<?> kLineTendencyLive(String address);
    Response<?> kLineTendencyFourHours(String address);
    Response<?> kLineTendencyOneDay(String address);

}
