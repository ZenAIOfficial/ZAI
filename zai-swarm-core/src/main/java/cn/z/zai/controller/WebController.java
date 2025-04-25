package cn.z.zai.controller;

import cn.z.zai.config.ratelimiter.AccessInterceptor;
import cn.z.zai.dto.Response;
import cn.z.zai.dto.entity.SlippageVo;
import cn.z.zai.dto.so.BasePageSo;
import cn.z.zai.dto.so.TokenDetailSo;
import cn.z.zai.dto.so.ZShotTransactionSo;
import cn.z.zai.dto.vo.WebBotHolderReq;
import cn.z.zai.dto.vo.WebBotTransaction;
import cn.z.zai.dto.vo.WebBotUserTokensReq;
import cn.z.zai.dto.vo.WebSwap;
import cn.z.zai.dto.vo.WebTransfer;
import cn.z.zai.service.SlippageService;
import cn.z.zai.service.UserAccountTransactionHistoryService;
import cn.z.zai.service.WebBotMsgService;
import cn.z.zai.service.WebService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/web")
public class WebController {

    @Autowired
    private UserAccountTransactionHistoryService userAccountTransactionHistoryService;
    @Autowired
    private WebBotMsgService webBotMsgService;

    @Autowired
    private SlippageService slippageService;

    @Autowired
    private WebService webService;

    /**
     * send
     *
     * @param so
     * @return
     */
    @AccessInterceptor(key = "user", permitsPerSecond = 1)
    @PostMapping("/transaction/send")
    public Response<?> sendTransaction(@RequestBody ZShotTransactionSo so) {

        return webService.transactionSend(so);
    }



    /**
     * Recharge and transfer
     *
     * @param vo
     * @return
     */
    @AccessInterceptor(key = "user", permitsPerSecond = 1)
    @PostMapping("/transaction/transfer")
    public Response<?> transfer(@RequestBody @Valid WebTransfer vo) {
        return webService.transfer(vo);
    }

    /**
     * buy/sell
     *
     * @param vo
     * @return
     */
    @AccessInterceptor(key = "user", permitsPerSecond = 1)
    @PostMapping("/transaction/swapTrustee")
    public Response<?> swapTrustee(@RequestBody @Valid WebSwap vo) {
        return webService.swapWithTrusteeship(vo);
    }

    /**
     * Transaction Status
     *
     * @param so
     * @return
     */
    @AccessInterceptor(key = "user", permitsPerSecond = 1)
    @PostMapping("/transaction/status")
    public Response<?> transactionStatus(@RequestBody ZShotTransactionSo so) {

        return webService.transactionStatus(so);
    }

    /**
     *msg status
     *
     * @return
     */
    @AccessInterceptor(key = "user", permitsPerSecond = 2)
    @PostMapping("/webBot/msg/status")
    public Response<?> webBotMsgUpdate(@RequestBody WebBotTransaction check) {

        return webBotMsgService.updateZAiLineDetailTSStatus(check);

    }

    @AccessInterceptor(key = "user", permitsPerSecond = 3)
    @PostMapping("/webBot/user/tokens")
    public Response<?> tokens4user(@RequestBody WebBotUserTokensReq webBotUserTokensReq) {

        return webService.webTokenInfoList(webBotUserTokensReq);

    }

    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @PostMapping("/webBot/holder/top10")
    public Response<?> top10holderList(@RequestBody @Valid WebBotHolderReq webBotHolderReq) {

        return webService.top10holderList(webBotHolderReq);

    }

    /**
     * slippageUpdate
     *
     * @return
     */
    @AccessInterceptor(key = "user", permitsPerSecond = 3)
    @PostMapping("/webBot/slippageUpdate")
    public Response<?> slippageUpdate(@RequestBody SlippageVo slippageVo) {

        slippageService.updateSlippage(slippageVo);
        return Response.success();

    }


    @GetMapping("/webBot/transactionHistory")
    public Response<?> transactionHistory(BasePageSo so) {
        return Response.success(userAccountTransactionHistoryService.getWebTransactionHistoryPage(so));
    }

    /**
     * token Detail
     *
     * @param so
     * @return
     */
    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @GetMapping("/webBot/token/detail")
    public Response<?> detail(HttpServletRequest request, TokenDetailSo so) {
        return webService.tokenDetail(request, so);
    }


    /**
     * tokens
     *
     * @param so
     * @return
     */
    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @GetMapping("/webBot/tokens/page")
    public Response<?> tokensPage(HttpServletRequest request, TokenDetailSo so) {
        return webService.tokensPage(request, so);
    }

    /**
     * search token
     * @param so
     * @return
     */
    @AccessInterceptor(key = "quickActing", permitsPerSecond = 10)
    @GetMapping("/webBot/tokens/search")
    public Response<?> tokensSearch(TokenDetailSo so) {
        return webService.tokensSearch(so);
    }

    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @GetMapping("/webBot/price/tendencyAll")
    public Response<?> kLineTendencyAll(String address) {

        return webService.kLineTendencyAll(address);
    }

    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @GetMapping("/webBot/price/tendencyLive")
    public Response<?> kLineTendencyLive(String address) {

        return webService.kLineTendencyLive(address);
    }

    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @GetMapping("/webBot/price/tendencyFourHours")
    public Response<?> kLineTendencyFourHours(String address) {

        return webService.kLineTendencyFourHours(address);
    }

    @AccessInterceptor(key = "quickActing", permitsPerSecond = 2)
    @GetMapping("/webBot/price/tendencyOneDay")
    public Response<?> kLineTendencyOneDay(String address) {

        return webService.kLineTendencyOneDay(address);
    }

}
