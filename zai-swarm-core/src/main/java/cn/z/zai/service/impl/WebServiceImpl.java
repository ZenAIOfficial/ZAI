package cn.z.zai.service.impl;

import cn.z.zai.common.constant.BscAddressConstant;
import cn.z.zai.common.constant.ErrorConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.constant.TokenAddressConstant;
import cn.z.zai.common.enums.KafkaCommonMsgTypeEnum;
import cn.z.zai.common.enums.TokenNetWorkEnum;
import cn.z.zai.dto.Response;
import cn.z.zai.dto.entity.UserWalletAddress;
import cn.z.zai.dto.request.ZAIResponseFindWhales;
import cn.z.zai.dto.request.ZShotTransactionSwapBscReq;
import cn.z.zai.dto.response.BirdEyeHolderResp;
import cn.z.zai.dto.response.BirdEyeHolderResponse;
import cn.z.zai.dto.response.QuickNodeResponseSignatureStatusesItem;
import cn.z.zai.dto.response.QuickNodeResponseSignatureStatusesItemValue;
import cn.z.zai.dto.response.QuickNodeResponseTransactionReceipt;
import cn.z.zai.dto.response.ZShotTransactionResponse;
import cn.z.zai.dto.response.ZShotTransactionSignatureResponse;
import cn.z.zai.dto.so.TokenDetailSo;
import cn.z.zai.dto.so.ZShotTransactionSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenDetailWithUserTokenVo;
import cn.z.zai.dto.vo.UserTokenVo;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.dto.vo.WebBotHolderReq;
import cn.z.zai.dto.vo.WebBotUserTokensReq;
import cn.z.zai.dto.vo.WebSwap;
import cn.z.zai.dto.vo.WebTokenInfo;
import cn.z.zai.dto.vo.WebTransfer;
import cn.z.zai.dto.vo.ZShotTransactionSwapWithTrusteeshipVo;
import cn.z.zai.dto.vo.ZShotTransactionTransferVo;
import cn.z.zai.dto.vo.kafka.KafkaCommonMsgVo;
import cn.z.zai.exception.BaseException;
import cn.z.zai.service.AiBusinessService;
import cn.z.zai.service.SlippageService;
import cn.z.zai.service.SmartWalletService;
import cn.z.zai.service.TokenDetailService;
import cn.z.zai.service.TokenSearchService;
import cn.z.zai.service.TokenTendencyHandleService;
import cn.z.zai.service.UserService;
import cn.z.zai.service.UserTokenService;
import cn.z.zai.service.UserTradeDelayedService;
import cn.z.zai.service.WebService;
import cn.z.zai.service.ZShotTransactionService;
import cn.z.zai.util.CommonUtils;
import cn.z.zai.util.ContextHolder;
import cn.z.zai.util.JwtUtils;
import cn.z.zai.util.ListMergeUtils;
import cn.z.zai.util.RedisUtil;
import com.google.common.collect.Lists;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WebServiceImpl implements WebService {

    private static final List<String> ignoreAddress =
        Lists.newArrayList("So11111111111111111111111111111111111111111", "So11111111111111111111111111111111111111112",
            "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
    @Autowired
    private ZShotTransactionService zShotTransactionService;

    @Autowired
    private UserTradeDelayedService userTradeDelayedService;

    @Autowired
    private TokenTendencyHandleService tokenTendencyHandleService;

    @Autowired
    private SlippageService slippageService;

    @Autowired
    private AiBusinessService aiBusinessService;

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private TokenSearchService tokenSearchService;

    @Autowired
    private QuickNodeBSCApi quickNodeBSCApi;

    @Autowired
    private SmartWalletService smartWalletService;

    @Autowired
    private TokenDetailService tokenDetailService;

    @Autowired
    private QuickNodeApi quickNodeApi;
    @Autowired
    private UserService userService;


    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RedisUtil redisUtil;

    @Override
    public Response<?> transactionSend(ZShotTransactionSo so) {
        BigInteger tgUserId = ContextHolder.getUserId();
        so.setTgUserId(String.valueOf(tgUserId));
        ZShotTransactionResponse<ZShotTransactionSignatureResponse> response =
            zShotTransactionService.sendTransaction(so);
        if (response == null) {
            log.error("sendTransaction is empty {}", tgUserId);
            return Response.fail();
        } else {
            if (response.getCode() == 200) {
                userTradeDelayedService.triggerDelayedUserToken(ContextHolder.getUserId());
                return Response.success(response.getResult());
            } else {
                return Response.fail(response.getCode(), response.getMessage());
            }
        }
    }

    @Override
    public Response<?> transfer(WebTransfer vo) {

        String mintAddress;
        long amount;
        int decimals;

        // sol
        if (Objects.equals(0, vo.getCoinType())) {

            mintAddress = TokenAddressConstant.WSOL_ADDRESS;
            decimals = TokenAddressConstant.SOL_DECIMALS;
            amount = CommonUtils.getAmount(vo.getRealAmount(), decimals);

            // usdc
        } else if (Objects.equals(1, vo.getCoinType())) {
            mintAddress = TokenAddressConstant.USDC_ADDRESS;
            decimals = TokenAddressConstant.USDC_DECIMALS;
            amount = CommonUtils.getAmount(vo.getRealAmount(), decimals);
        } else {
            return Response.fail(ErrorConstant.NOT_AVAILABLE, "coinType is error");
        }

        BigInteger userId = ContextHolder.getUserId();

        UserVo userInfo = userService.getUserByTgUserId(userId);

        ZShotTransactionTransferVo build =
            ZShotTransactionTransferVo.builder().fromAddress(vo.getFromAddress()).toAddress(userInfo.getAddress())
                .mintAddress(mintAddress).amount(amount).decimals(decimals).tgUserId(String.valueOf(userId)).build();

        ZShotTransactionResponse<ZShotTransactionSignatureResponse> response = zShotTransactionService.transfer(build);

        if (response == null) {
            log.error("WebService transfer send ts is empty {}, param is {}", userId, build);
            return Response.fail();
        } else {
            if (response.getCode() == 200) {
                return Response.success(response.getResult());
            } else {
                return Response.fail(response.getCode(), response.getMessage());
            }
        }
    }

    @Override
    public Response<?> swapWithTrusteeship(WebSwap vo) {

        log.info("swapTrustee start , {}", vo);

        BigInteger userId = ContextHolder.getUserId();

        UserVo userInfo = userService.getUserByTgUserId(userId);
        String bscWalletAddress = userInfo.getUserWalletAddress().stream()
            .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
            .orElse(new UserWalletAddress()).getWalletAddress();

        Integer slippageBps;
        if (Objects.isNull(vo.getSlippageBps())) {
            slippageBps = slippageService.buySlippage(userId);
        } else {
            slippageBps = vo.getSlippageBps();
        }

        ZShotTransactionSwapWithTrusteeshipVo swap;

        ZShotTransactionSwapBscReq swapBsc;
        // buy
        if (Objects.equals(vo.getSwapType(), 0)) {

            swap = ZShotTransactionSwapWithTrusteeshipVo.builder().ownerAddress(userInfo.getAddress())
                .inputMintAddress(TokenAddressConstant.WSOL_ADDRESS)
                .inputMintDecimals(TokenAddressConstant.SOL_DECIMALS)
                .price(aiBusinessService.priceTokens(TokenAddressConstant.WSOL_ADDRESS))
                .amount(CommonUtils.getAmount(vo.getRealAmount(), TokenAddressConstant.SOL_DECIMALS))
                .outputMintAddress(vo.getMintAddress()).slippageBps(slippageBps).tgUserId(String.valueOf(userId))
                .superiorsAddress(userInfo.getSuperiorsAddress()).build();

            // bsc
            swapBsc = ZShotTransactionSwapBscReq.builder().buyToken(vo.getMintAddress())
                .sellToken(BscAddressConstant.BNB_ADDRESS).fromAddress(bscWalletAddress)
                .value(vo.getRealAmount().toPlainString()).build();
            // sell
        } else if (Objects.equals(vo.getSwapType(), 1)) {

            UserTokenVo userTokenVo = userTokenService.queryByAddressAndTgUserId(userId, vo.getMintAddress());
            if (Objects.isNull(userTokenVo)) {
                return Response.fail(ErrorConstant.NOT_AVAILABLE,
                    "You don’t currently have this token in your account.");
            }
            if (CommonUtils.getTokens(userTokenVo.getAmount(), userTokenVo.getDecimals(), userTokenVo.getDecimals())
                .compareTo(vo.getRealAmount()) < 0) {
                return Response.fail(ErrorConstant.NOT_AVAILABLE,
                    "our current account has an insufficient amount of this token.");
            }

            swap = ZShotTransactionSwapWithTrusteeshipVo.builder().ownerAddress(userInfo.getAddress())
                .inputMintAddress(vo.getMintAddress()).inputMintDecimals(userTokenVo.getDecimals())
                .price(aiBusinessService.priceTokens(vo.getMintAddress()))
                .amount(CommonUtils.getAmount(vo.getRealAmount(), userTokenVo.getDecimals()))
                .outputMintAddress(TokenAddressConstant.WSOL_ADDRESS).slippageBps(slippageBps)
                .tgUserId(String.valueOf(userId)).superiorsAddress(userInfo.getSuperiorsAddress()).build();

            swapBsc = ZShotTransactionSwapBscReq.builder().sellToken(vo.getMintAddress())
                .buyToken(BscAddressConstant.BNB_ADDRESS).fromAddress(bscWalletAddress)
                .value(vo.getRealAmount().toPlainString()).build();
        } else {
            return Response.fail(ErrorConstant.NOT_AVAILABLE, "swapType error");
        }

        ZShotTransactionResponse<ZShotTransactionSignatureResponse> response;
        String network = tokenSearchService.tokenNetwork(vo.getMintAddress());
        if (StringUtils.equals(network, TokenNetWorkEnum.BSC.getNetwork())) {
            response = zShotTransactionService.swap4BscWithTrusteeship(swapBsc);
        } else {
            response = zShotTransactionService.swapWithTrusteeship(swap);
        }

        if (response == null) {
            log.error("WebService swapWithTrusteeship send is empty {}, param is {}", userId, swap);
            return Response.fail();
        } else {
            if (response.getCode() == 200) {
                return Response.success(response.getResult());
            } else {
                return Response.fail(response.getCode(), response.getMessage());
            }
        }
    }

    @Override
    public Response<?> transactionStatus(ZShotTransactionSo so) {

        BigInteger tgUserId = ContextHolder.getUserId();
        so.setTgUserId(String.valueOf(tgUserId));
        String network = redisUtil.get(
            String.format(RedisCacheConstant.WEBBOT_TRANSACTION_NETWORK, tgUserId, so.getTransaction()), String.class);
        QuickNodeResponseSignatureStatusesItem response = null;
        if (StringUtils.equalsIgnoreCase(network, TokenNetWorkEnum.BSC.getNetwork())) {
            QuickNodeResponseTransactionReceipt receipt = quickNodeBSCApi.ethGetTransactionReceipt(so.getTransaction());

            if (Objects.nonNull(receipt) && StringUtils.equals(receipt.getStatus(), "0x1")) {
                response = new QuickNodeResponseSignatureStatusesItem();
                QuickNodeResponseSignatureStatusesItemValue value = new QuickNodeResponseSignatureStatusesItemValue();
                value.setConfirmationStatus("confirmed");
                List<QuickNodeResponseSignatureStatusesItemValue> valueList = new ArrayList<>();
                valueList.add(value);
                response.setValue(valueList);
            }
        } else {
            response = quickNodeApi.getSignatureStatuses(so.getTransaction());
        }

        if (response == null) {
            log.error("transactionStatus fail {}", tgUserId);
            return Response.fail(ErrorConstant.IGNORE_ERROR, "not found");
        } else {
            List<QuickNodeResponseSignatureStatusesItemValue> valueList = response.getValue();
            if (valueList.size() > 0) {
                QuickNodeResponseSignatureStatusesItemValue item = valueList.get(0);
                if (item != null) {
                    log.info("transactionStatus success {} {} {}", tgUserId, so.getTransaction(),
                        item.getConfirmationStatus());
                    return Response.success(item);
                } else {
                    log.info("transactionStatus empty {}", tgUserId);
                    return Response.fail(ErrorConstant.IGNORE_ERROR, "not found");
                }
            } else {
                log.info("transactionStatus empty {}", tgUserId);
                return Response.fail(ErrorConstant.IGNORE_ERROR, "not found");
            }
        }
    }

    @Override
    public Response<?> webTokenInfoList(WebBotUserTokensReq webBotUserTokensReq) {

        BigInteger userId = ContextHolder.getUserId();

        WebTokenInfo webTokenInfo = new WebTokenInfo();
        List<UserTokenVo> tokenListSol = new ArrayList<>();
        if (StringUtils.isEmpty(webBotUserTokensReq.getNetwork())
            || StringUtils.equals(webBotUserTokensReq.getNetwork(), TokenNetWorkEnum.SOLANA.getNetwork())) {
            tokenListSol = userTokenService.getTokenList(userId, Boolean.TRUE);
        }
        if (CollectionUtils.isEmpty(tokenListSol)) {
            tokenListSol = new ArrayList<>();
        }
        List<UserTokenVo> tokenListBsc = new ArrayList<>();
        if (StringUtils.isEmpty(webBotUserTokensReq.getNetwork())
            || StringUtils.equals(webBotUserTokensReq.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())) {
            tokenListBsc = userTokenService.getTokenListBsc(userId, Boolean.TRUE);
        }

        if (CollectionUtils.isEmpty(tokenListBsc)) {
            tokenListBsc = new ArrayList<>();
        }
        List<UserTokenVo> shortListSol = new ArrayList<>();
        List<UserTokenVo> shortListBsc = new ArrayList<>();
        shortAndCompareSol(tokenListSol, shortListSol);
        shortAndCompareBsc(tokenListBsc, shortListBsc);
        webTokenInfo.setTokenList(ListMergeUtils.mergeAlternating(shortListBsc, shortListSol));

        List<UserTokenVo> tokenList = new ArrayList<>();
        tokenList.addAll(tokenListSol);
        tokenList.addAll(tokenListBsc);
        double totalBalance =
            tokenList.stream()
                .mapToDouble(item -> CommonUtils
                    .getTokenValuePrice(item.getPrice(), item.getAmount(), item.getDecimals(), null).doubleValue())
                .sum();
        webTokenInfo.setTotalBalance(BigDecimal.valueOf(totalBalance).divide(BigDecimal.ONE, 4, RoundingMode.HALF_UP));

        Map<String, BigDecimal> priceMap = tokenList.stream().filter(Objects::nonNull)
            .collect(Collectors.toMap(UserTokenVo::getAddress, UserTokenVo::getPrice, (k1, k2) -> k2));
        webTokenInfo.setPriceMap(priceMap);
        if (redisUtil.setIfAbsent("webTokenInfo:get:lock:" + userId, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_5,
            TimeUnit.SECONDS)) {
            userService.sendMessageSyncAccountInfo(userId);
        }
        return Response.success(webTokenInfo);
    }


    @Override
    public Response<?> top10holderList(WebBotHolderReq webBotHolderReq) {

        TokenDetailVo tokenDetailVo = tokenDetailService.queryWithCache(webBotHolderReq.getTokenAddress());

        BirdEyeHolderResp birdEyeHolderResp =
                smartWalletService.top10holderDetail(webBotHolderReq.getTokenAddress(), tokenDetailVo);
        if (Objects.nonNull(birdEyeHolderResp) && CollectionUtils.isNotEmpty(birdEyeHolderResp.getItems())) {

            for (BirdEyeHolderResponse item : birdEyeHolderResp.getItems()) {
                if (tokenDetailVo.getTotalSupply().compareTo(BigDecimal.ZERO) == 0
                        && tokenDetailVo.getCirculatingSupply().compareTo(BigDecimal.ZERO) == 0) {
                    item.setHolding(BigDecimal.ZERO);
                } else {
                    BigDecimal supply = tokenDetailVo.getTotalSupply();
                    if (tokenDetailVo.getTotalSupply().compareTo(BigDecimal.ZERO) == 0) {
                        supply = tokenDetailVo.getCirculatingSupply();
                    }
                    item.setHolding(new BigDecimal(item.getUi_amount()).divide(supply, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal(100)).setScale(2, RoundingMode.HALF_UP));
                }
            }
            return Response.success(birdEyeHolderResp);
        }
        BirdEyeHolderResp def = new BirdEyeHolderResp();
        def.setItems(new ArrayList<>());

        return Response.success(def);
    }

    @Override
    public Response<?> tokenDetail(HttpServletRequest request, TokenDetailSo so) {

        if (org.springframework.util.StringUtils.isEmpty(so.getAddress()) || ignoreAddress.contains(so.getAddress())) {
            log.warn("[/token/detail] address is missing or hide,so={}", so);
            throw new BaseException(ErrorConstant.NOT_AVAILABLE, "Token not supported yet, Please try again later");
        }
        so.setTgUserId(getTgUserId(request));
        TokenDetailWithUserTokenVo tokenDetailWithUserTokenVo = tokenDetailService.tokenDetailWithUserTokenInfo(so);

        BigDecimal bigDecimal =
                redisUtil.get(String.format(RedisCacheConstant.BIRD_EYE_PRICE_24H_CHANGE_MULTIPLE_KEY, so.getAddress()),
                        BigDecimal.class);
        if (Objects.nonNull(bigDecimal) && Objects.nonNull(tokenDetailWithUserTokenVo)) {
            tokenDetailWithUserTokenVo.setPrice24hChange(bigDecimal);
        }
        String analyzeDetail = String.format(RedisCacheConstant.ADDRESS_INFO_DETAIL, so.getAddress());
        ZAIResponseFindWhales zaiResponseFindWhales = redisUtil.get(analyzeDetail, ZAIResponseFindWhales.class);
        if (Objects.nonNull(zaiResponseFindWhales)) {
            tokenDetailWithUserTokenVo.setWhalesProbability(zaiResponseFindWhales.getProbability());
        }
        return Response.success(tokenDetailWithUserTokenVo);
    }

    @Override
    public Response<?> tokensPage(HttpServletRequest request, TokenDetailSo so) {
        so.setTgUserId(getTgUserId(request));
        return Response.success(tokenDetailService.queryTokenWithPageNew(so));
    }

    @Override
    public Response<?> tokensSearch(TokenDetailSo so) {
        if (org.springframework.util.StringUtils.isEmpty(so.getAddressOrSymbol())
                || ignoreAddress.contains(so.getAddressOrSymbol())) {
            log.info("search address is ignore ,address={}", so.getAddressOrSymbol());
            return Response.success(Collections.emptyList());
        }
        if (StringUtils.isNotEmpty(so.getNetwork())) {
            return Response.success(tokenDetailService.searchByAddressOrSymbol(so).stream()
                    .filter(s -> org.apache.commons.lang3.StringUtils.equalsAnyIgnoreCase(s.getNetwork(), so.getNetwork()))
                    .collect(Collectors.toList()));
        }
        return Response.success(tokenDetailService.searchByAddressOrSymbol(so));
    }


    @Override
    public Response<?> kLineTendencyAll(String address) {
        return Response.success(tokenTendencyHandleService.allTendencyLine(address));
    }

    @Override
    public Response<?> kLineTendencyLive(String address) {
        return Response.success(tokenTendencyHandleService.live(address));
    }

    @Override
    public Response<?> kLineTendencyFourHours(String address) {
        return Response.success(tokenTendencyHandleService.fourHours(address));
    }

    @Override
    public Response<?> kLineTendencyOneDay(String address) {
        return Response.success(tokenTendencyHandleService.oneDay(address));
    }


    private List<UserTokenVo> shortAndCompareSol(List<UserTokenVo> tokenList, List<UserTokenVo> shortList) {
        UserTokenVo solInfo = null;
        UserTokenVo usdCInfo = null;
        List<UserTokenVo> compareList = new ArrayList<>();
        for (UserTokenVo userTokenVo : tokenList) {
            UserTokenVo compare = new UserTokenVo();
            BeanUtils.copyProperties(userTokenVo, compare);
            compare.setPrice(null);
            compareList.add(compare);

            if (StringUtils.equals(userTokenVo.getAddress(), TokenAddressConstant.SOL_ADDRESS)) {
                solInfo = userTokenVo;
                continue;
            }
            if (StringUtils.equals(userTokenVo.getAddress(), TokenAddressConstant.USDC_ADDRESS)) {
                usdCInfo = userTokenVo;
                continue;
            }
            shortList.add(userTokenVo);

        }
        if (Objects.nonNull(usdCInfo)) {
            shortList.add(0, usdCInfo);
        }
        if (Objects.nonNull(solInfo)) {
            shortList.add(0, solInfo);
        }

        return compareList;

    }

    private List<UserTokenVo> shortAndCompareBsc(List<UserTokenVo> tokenList, List<UserTokenVo> shortList) {
        UserTokenVo bscInfo = null;
        UserTokenVo usdCInfo = null;
        List<UserTokenVo> compareList = new ArrayList<>();
        for (UserTokenVo userTokenVo : tokenList) {
            UserTokenVo compare = new UserTokenVo();
            BeanUtils.copyProperties(userTokenVo, compare);
            compare.setPrice(null);
            compareList.add(compare);

            if (StringUtils.equals(userTokenVo.getAddress(), BscAddressConstant.BNB_ADDRESS)) {
                bscInfo = userTokenVo;
                continue;
            }
            if (StringUtils.equals(userTokenVo.getAddress(), BscAddressConstant.BSC_USDT)) {
                usdCInfo = userTokenVo;
                continue;
            }
            shortList.add(userTokenVo);

        }
        if (Objects.nonNull(usdCInfo)) {
            shortList.add(0, usdCInfo);
        }
        if (Objects.nonNull(bscInfo)) {
            shortList.add(0, bscInfo);
        }

        return compareList;

    }

    private BigInteger getTgUserId(HttpServletRequest request) {

        String token = request.getHeader(jwtUtils.getHeader());
        if (StringUtils.isBlank(token)) {
            token = request.getParameter(jwtUtils.getHeader());
        }
        if (StringUtils.isEmpty(token)) {
            return null;
        }
        Claims claims = jwtUtils.getClaimByToken(token);
        if (claims == null || jwtUtils.isTokenExpired(claims.getExpiration())) {
            return null;
        }

        String key = String.format(RedisCacheConstant.AUTH_TOKEN_KEY, claims.getId());
        Object tokenCache = redisUtil.get(key);
        if (!token.equals(tokenCache)) {

            return null;
        }
        String[] split = claims.getId().split("_");
        String userIdString = split[0];
        if (StringUtils.isEmpty(userIdString)) {

            return null;
        }
        BigInteger userId = BigInteger.valueOf(Long.parseLong(userIdString));
        if (userId.compareTo(BigInteger.ZERO) <= 0) {
            return null;
        }
        return userId;
    }
}
