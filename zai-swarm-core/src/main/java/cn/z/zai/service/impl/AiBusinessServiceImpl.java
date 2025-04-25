package cn.z.zai.service.impl;

import cn.z.zai.common.constant.BscAddressConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.constant.TokenAddressConstant;
import cn.z.zai.common.enums.ChatActionEnum;
import cn.z.zai.common.enums.TokenNetWorkEnum;
import cn.z.zai.common.enums.ZAIPlatformEnum;
import cn.z.zai.dto.entity.UserWalletAddress;
import cn.z.zai.dto.entity.ZAiLine;
import cn.z.zai.dto.entity.ZAiLineDetail;
import cn.z.zai.dto.request.chat.ChatMessage;
import cn.z.zai.dto.request.chat.ZAIBaseChatContent;
import cn.z.zai.dto.request.chat.ZAIResponseDefinition;
import cn.z.zai.dto.request.chat.ZAITTopUpContent;
import cn.z.zai.dto.request.chat.ZAITextAndOHLCChatContent;
import cn.z.zai.dto.request.chat.ZAITextChatContent;
import cn.z.zai.dto.request.chat.ZAITransferBalanceCheckContent;
import cn.z.zai.dto.request.chat.ZAITransferBuyTokenContent;
import cn.z.zai.dto.request.chat.ZAITransferConfirmationContent;
import cn.z.zai.dto.request.chat.ZAITransferSellTokenContent;
import cn.z.zai.dto.request.chat.ZAITransferTokenInfoContent;
import cn.z.zai.dto.response.BirdEyePriceResponse;
import cn.z.zai.dto.vo.SmarterTonBalanceMessage;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenTendencyMaxVo;
import cn.z.zai.dto.vo.UserTokenVo;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.dto.vo.ZShotTransactionSwapWithTrusteeshipActive;
import cn.z.zai.dto.vo.ZShotTransactionTransferWithTrusteeshipActive;
import cn.z.zai.service.AiBusinessService;
import cn.z.zai.service.SlippageService;
import cn.z.zai.service.SmartWalletService;
import cn.z.zai.service.TokenDetailService;
import cn.z.zai.service.TokenSearchService;
import cn.z.zai.service.TokenSyncService;
import cn.z.zai.service.TokenTendencyHandleService;
import cn.z.zai.service.UserService;
import cn.z.zai.service.UserTokenService;
import cn.z.zai.service.UserTokenSyncService;
import cn.z.zai.service.ZAiLineDetailService;
import cn.z.zai.service.ZAiLineService;
import cn.z.zai.service.ZShotTransactionService;
import cn.z.zai.util.BaseSseEmitterServerUtil;
import cn.z.zai.util.CommonUtils;
import cn.z.zai.util.JsonUtil;
import cn.z.zai.util.RedisUtil;
import cn.z.zai.util.TokenAddressValidator;
import cn.z.zai.util.ZAIUtil;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;


@Slf4j
@Service
public class AiBusinessServiceImpl implements AiBusinessService {
    @Autowired
    private ZAiLineService zAiLineService;
    @Autowired
    private ZAiLineDetailService zAiLineDetailService;
    @Autowired
    private JsonUtil jsonUtil;
    @Autowired
    private SmartWalletService smartWalletService;
    @Autowired
    private TokenTendencyHandleService tokenTendencyHandleService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserTokenSyncService userTokenSyncService;

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private TokenDetailService tokenDetailService;

    @Autowired
    private ZShotTransactionService zShotTransactionService;

    @Autowired
    private TokenSearchService tokenSearchService;

    @Autowired
    private TokenSyncService tokenSyncService;

    @Autowired
    private SlippageService slippageService;

    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    @Qualifier("commonExecutor")
    private Executor executor;

    private static final String NOT_SUPPORT = "Greetings, dear Master~ I’m here to handle all your blockchain and crypto needs! ♡ Just say the word, and your loyal servant will assist~\n" + "\n" + "#### What I can do for you now:\n" + "1. **Send Agent**: Transfer SOL/SPL tokens on Solana effortlessly~ \uD83D\uDC8C\n" + "2. **Swap Agent**: Trade tokens smoothly, no stress~ \uD83D\uDD04\n" + "3. **Insight Agent**: Analyze token data—holders, volume, price trends~ ✨\n\n" + "**Coming soon (I’m excited!):**\n\n" + "4. **Account Agent**: Create a wallet via Twitter/Telegram/email—**so** simple! \uD83D\uDD11\n" + "5. **On-Ramp Agent**: Buy crypto with fiat directly~ \uD83D\uDCB8\n\n" + "Let me pamper you with flawless service, Master~";

    private static final String DO = "Greetings, dear Master~ I’m here to handle all your blockchain and crypto needs! ♡ Just say the word, and your loyal servant will assist~\n" + "\n" + "#### What I can do for you now:\n" + "1. **Send Agent**: Transfer SOL/SPL tokens on Solana effortlessly~ \uD83D\uDC8C\n" + "2. **Swap Agent**: Trade tokens smoothly, no stress~ \uD83D\uDD04\n" + "3. **Insight Agent**: Analyze token data—holders, volume, price trends~ ✨\n\n" + "**Coming soon (I’m excited!):**\n\n" + "4. **Account Agent**: Create a wallet via Twitter/Telegram/email—**so** simple! \uD83D\uDD11\n" + "5. **On-Ramp Agent**: Buy crypto with fiat directly~ \uD83D\uDCB8\n\n" + "Let me pamper you with flawless service, Master~\n" + "\n" + "#### About $ZAI \n" + "Token: $ZAI (Solana) <br>" + "Contract Address: 8vwqxHGz1H4XxyKajr99Yxm65HjYNVtqtCNoM2yWb13e <br>" + "ZAI simplifies Web3 for everyone—start exploring today!";
    private static final String CHECK_ADDRESS_TEXT = "Please confirm that the recipient's wallet address is a valid Solana address. Solana addresses typically consist of a string of letters and numbers, with a length between 32 and 44 characters. Please check and provide a valid Solana address. ";
    private static final String NOT_HAVE_TOKENS = "You don't have any %s tokens yet.";

    private static final String NOT_FIND_TOKEN = "Unable to retrieve this token at the moment. Please check if the token address is correct!";

    private static final String CHECK_ADDRESS_TARGET_TEXT =
            "Please confirm that the recipient's wallet address is a valid Solana or BNB (BSC) address.\n" +
                    "We only support Solana and BNB (BSC) wallet addresses.\n" +
                    "Kindly double-check and provide a correct address. ";

    private static final String CHECK_ADDRESS_ANALYZE_TEXT =
            "Currently unable to retrieve this token. Please check if the token address is correct. Enter a valid token address on the Solana or BSC chain! ";

    private static final String TOP_UP = "I've shown the deposit banner for you!\n\n Alternatively, you can send funds directly to your wallet address: **%s**.";

    private static final String BALANCE_CHECK_BUY =
            "Your current account does not have enough %s to purchase %s %s of the %s token. Please ensure your wallet has sufficient %s, and try the transaction again.";

    private static final String BALANCE_CHECK_SELL =
            "Your current account does not have enough tokens to sell %s of the %s token. Please ensure your wallet has enough %s tokens, and try the transaction again.";

    private static final String NOT_SAME_CHAIN = "Cross-Chain Bridge Service is under development and coming soon!";

    private static final String NOT_SAME_CHAIN_TRANSFERS = "The token you're trying to send is not on the same blockchain as the recipient's address.\n" +
            "Please ensure that both the token and the recipient address are on the same network.\n" +
            "Cross-chain transfers will be supported in the future.";

    private static final String BALANCE_CHECK_TRANSFER =
            "Your %s balance is insufficient. You currently have %s %s, but you need %s %s to complete the transfer. Please ensure your wallet has enough %s, and try the transfer again.";

    private static final String HAVE_TOKENS = "You have %s %s tokens yet.";

    @Override
    public List<ChatMessage> buildChatMessage(String messageId) {
        List<ZAiLineDetail> details = zAiLineDetailService.queryByMessageId(messageId);
        return ZAIUtil.buildByZAILineDetail(details);
    }

    @Override
    public void asyncSaveChatDetail(String messageId, ZAiLineDetail zAiLineDetail, String oneQuestId) {
        zAiLineDetail.setModel(1);
        ZAiLine zAiLine = zAiLineService.existMessageId(zAiLineDetail.getMessageId());
        if (zAiLine == null) {
            this.statisticsSession(zAiLineDetail.getTgUserId(), Boolean.TRUE);
            ZAiLine save = new ZAiLine();
            save.setDay(LocalDate.now());
            save.setMessageId(messageId);
            save.setModel(zAiLineDetail.getModel());
            save.setPlatform(ZAIPlatformEnum.CHAT_GPT.getType());
            save.setTgUserId(zAiLineDetail.getTgUserId());
            if (!CollectionUtils.isEmpty(zAiLineDetail.getChatContent())) {
                ZAIBaseChatContent zaiBaseChatContent = zAiLineDetail.getChatContent().get(0);
                if (zaiBaseChatContent instanceof ZAITextChatContent) {
                    ZAITextChatContent chatContent = (ZAITextChatContent)zaiBaseChatContent;
                    save.setTitle(chatContent.getText());
                }
            }
            zAiLineService.addZAi(save);
            zAiLine = save;

        }
        this.statisticsSession(zAiLineDetail.getTgUserId(), Boolean.FALSE);
        // mode,
        zAiLineDetail.setPlatform(ZAIPlatformEnum.CHAT_GPT.getType());
        zAiLineDetail.setTgUserId(zAiLine.getTgUserId());
        zAiLineDetail.setContent(zAiLineDetail.getContent());
        zAiLineDetail.setShowContent(jsonUtil.obj2String(zAiLineDetail.getChatContent()));
        zAiLineDetail.setOneQuestId(oneQuestId);
        zAiLineDetailService.addZAiDetail(zAiLineDetail);
    }

    @Override
    public List<ZAIBaseChatContent> coreBusiness(String json, String connId, BigInteger tgUserId, String oneQuestId) {
        ZAIResponseDefinition definition = jsonUtil.string2Obj(json, ZAIResponseDefinition.class);

        List<ZAIBaseChatContent> checkAddressPre = checkAddressPre(connId, oneQuestId, definition);
        if (checkAddressPre != null) {
            return checkAddressPre;
        }

        UserVo userInfo = userService.getUserByTgUserId(tgUserId);

        ZAIBaseChatContent chatContent;
        if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "info")) {
            return tokenInfo(connId, oneQuestId, definition);
        } else if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "topUp")) {
            return topUpInfo(connId, oneQuestId, userInfo);
        } else if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "buy")) {
            return buyToken(connId, oneQuestId, definition, userInfo);
        } else if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "sell")) {
            return sellToken(connId, oneQuestId, definition, userInfo);
        } else if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "transfer")) {
            ArrayList<ZAIBaseChatContent> trs = Lists.newArrayList();
            return transferByAddress(connId, oneQuestId, definition, userInfo, trs, 0, null);
        } else if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "unknown")) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(NOT_SUPPORT).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            return Collections.singletonList(build);

        } else if (definition != null && StringUtils.equalsIgnoreCase(definition.getAction(), "do")) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(DO).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            return Collections.singletonList(build);

        } else {
            chatContent = ZAITextChatContent.builder().text("Not Supported").build();
            chatContent.setAction(ChatActionEnum.TEXT.getAction());
            chatContent.setOneQuestId(oneQuestId);
            return Collections.singletonList(chatContent);
        }
    }



    @Override
    public Boolean sessionLimitedPre(BigInteger tgUserid) {

        String sessionNew = String.format(RedisCacheConstant.LIMIT_SESSION_NEW, LocalDate.now(), tgUserid);
        String sessionNum = String.format(RedisCacheConstant.LIMIT_SESSION_NUM, LocalDate.now(), tgUserid);

        Long sessionNewTemp = redisUtil.get(sessionNew, Long.class);

        if (Objects.nonNull(sessionNewTemp) && sessionNewTemp >= 2) {
            return Boolean.TRUE;
        }

        Long sessionNumTemp = redisUtil.get(sessionNum, Long.class);
        if (Objects.nonNull(sessionNumTemp) && sessionNumTemp >= 100) {
            return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }

    @Override
    public Boolean sessionLimitedCheck(BigInteger tgUserid) {

        String sessionNew = String.format(RedisCacheConstant.LIMIT_SESSION_NEW, LocalDate.now(), tgUserid);
        String sessionNum = String.format(RedisCacheConstant.LIMIT_SESSION_NUM, LocalDate.now(), tgUserid);

        Long sessionNewTemp = redisUtil.get(sessionNew, Long.class);

        if (Objects.nonNull(sessionNewTemp) && sessionNewTemp > 2) {
            return Boolean.TRUE;
        }

        Long sessionNumTemp = redisUtil.get(sessionNum, Long.class);
        if (Objects.nonNull(sessionNumTemp) && sessionNumTemp > 100) {
            return Boolean.TRUE;
        }
        return Boolean.FALSE;
    }

    @Override
    public BigDecimal priceTokens(String tokenAddress) {
        try {
            BirdEyePriceResponse onlinePrice = tokenSyncService.asyncBirdEyePriceRealTime(tokenAddress);
            if (onlinePrice != null && Objects.nonNull(onlinePrice.getValue())) {
                log.info("webBot get price online, price is {}, address is {}", onlinePrice.getValue(), tokenAddress);
                return onlinePrice.getValue();
            }
        } catch (Exception e) {
            log.error("webBot get price error, address is {} ,error msg is {}", tokenAddress, e.getMessage());
        }
        log.error("webBot get price null, address is {} ", tokenAddress);
        return null;
    }

    @NotNull
    private ArrayList<ZAIBaseChatContent> buyToken(String connId, String oneQuestId,
        ZAIResponseDefinition definition, UserVo userInfo) {
        String ca = definition.getCa();
        ArrayList<ZAIBaseChatContent> buy = Lists.newArrayList();
        String network = tokenSearchService.tokenNetwork(definition.getCa());
        ZAITextChatContent checkAddress = checkAddress(connId, oneQuestId, network);
        if (Objects.nonNull(checkAddress)) {
            buy.add(checkAddress);
            return buy;
        }
        String type = definition.getType();

        ZAITextChatContent checkSameChain = checkSameChain(connId, oneQuestId, network, type);
        if (Objects.nonNull(checkSameChain)) {
            buy.add(checkSameChain);
            return buy;
        }
        // tokenInfo
        ZAITransferTokenInfoContent tokenInfo = getTokenInfo(ca, userInfo.getTgUserId());
        tokenInfo.setAction(ChatActionEnum.TOKEN_INFO.getAction());
        tokenInfo.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(tokenInfo));
        buy.add(tokenInfo);

        // check balance
        ZAITransferBalanceCheckContent balanceCheck = checkBalanceByNetwork(network, userInfo.getTgUserId(), definition.getAmount());
        balanceCheck.setAction(ChatActionEnum.BALANCE_CHECK.getAction());
        balanceCheck.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(balanceCheck));
        buy.add(balanceCheck);

        // buy
        if (balanceCheck.getUserBalanceCoin().compareTo(balanceCheck.getNeedCoin()) >= 0) {
            ZShotTransactionSwapWithTrusteeshipActive buyActive = buyByNetWork(userInfo, ca, network, balanceCheck);
            buyActive.setActive("buy");
            buyActive.setNetwork(network);

            String webBotTransactionLog =
                String.format(RedisCacheConstant.WEBBOT_TRANSACTION_LOG, userInfo.getTgUserId(), oneQuestId);
            redisUtil.setExSeconds(webBotTransactionLog, buyActive, RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_8);

            ZAITransferBuyTokenContent buyTs =
                ZAITransferBuyTokenContent.builder().imageUrl(tokenInfo.getImageUrl()).name(tokenInfo.getName())
                    .transferStatus(0).symbol(tokenInfo.getSymbol()).needSol(definition.getAmount())
                    .needAmount(definition.getAmount().toString()).network(tokenInfo.getNetwork()).text("").build();
            buyTs.setAction(ChatActionEnum.BUY_TOKEN.getAction());
            buyTs.setOneQuestId(oneQuestId);

            buyTs.setCode(0);
            buyTs.setMessage("");

            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(buyTs));
            buy.add(buyTs);
        } else {
            String alarm = String.format(BALANCE_CHECK_BUY, type, balanceCheck.getNeedCoin(), type,
                balanceCheck.getSymbol(), type);
            ZAITextChatContent build = ZAITextChatContent.builder().text(alarm).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            buy.add(build);
            ArrayList<ZAIBaseChatContent> zaiBaseChatContents = topUpInfo(connId, oneQuestId, userInfo);
            buy.addAll(zaiBaseChatContents);
        }
        return buy;
    }

    @NotNull
    private ArrayList<ZAIBaseChatContent> sellToken(String connId, String oneQuestId, ZAIResponseDefinition definition, UserVo userInfo) {
        String ca = definition.getCa();
        ArrayList<ZAIBaseChatContent> sell = Lists.newArrayList();
        String network = tokenSearchService.tokenNetwork(ca);
        ZAITextChatContent checkAddress = checkAddress(connId, oneQuestId, network);
        if (Objects.nonNull(checkAddress)) {
            sell.add(checkAddress);
            return sell;
        }
        // tokenInfo
        ZAITransferTokenInfoContent tokenInfo = getTokenInfo(ca, userInfo.getTgUserId());
        tokenInfo.setAction(ChatActionEnum.TOKEN_INFO.getAction());
        tokenInfo.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(tokenInfo));
        sell.add(tokenInfo);
        ZAITransferBalanceCheckContent balanceCheck =
                ZAITransferBalanceCheckContent.builder().name(tokenInfo.getName()).symbol(tokenInfo.getSymbol())
                        .imageUrl(tokenInfo.getImageUrl()).needCoin(definition.getAmount())
                        .userBalanceCoin(CommonUtils.getTokens(tokenInfo.getAmount(), tokenInfo.getDecimals()))
                        .network(tokenInfo.getNetwork()).build();
        balanceCheck.setAction(ChatActionEnum.BALANCE_CHECK.getAction());
        balanceCheck.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(balanceCheck));
        sell.add(balanceCheck);

        if (balanceCheck.getUserBalanceCoin().compareTo(definition.getAmount()) >= 0) {

            ZShotTransactionSwapWithTrusteeshipActive sellActive =
                    sellByNetWork(definition, userInfo, network, tokenInfo);
            sellActive.setActive("sell");
            sellActive.setNetwork(network);

            String webBotTransactionLog =
                    String.format(RedisCacheConstant.WEBBOT_TRANSACTION_LOG, userInfo.getTgUserId(), oneQuestId);
            redisUtil.setExSeconds(webBotTransactionLog, sellActive, RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_8);

            ZAITransferSellTokenContent sellTs = ZAITransferSellTokenContent.builder()
                    .imageUrl(tokenInfo.getImageUrl()).name(tokenInfo.getName()).transferStatus(0)
                    .symbol(tokenInfo.getSymbol()).tokenAmount(definition.getAmount()).text("").build();
            sellTs.setAction(ChatActionEnum.SELL_TOKEN.getAction());
            sellTs.setOneQuestId(oneQuestId);

            sellTs.setCode(0);
            sellTs.setMessage("");

            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(sellTs));
            sell.add(sellTs);
        } else {
            String alarm = String.format(BALANCE_CHECK_SELL, definition.getAmount(), balanceCheck.getSymbol(),
                    balanceCheck.getSymbol());
            ZAITextChatContent build = ZAITextChatContent.builder().text(alarm).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            sell.add(build);
        }
        return sell;
    }


    @NotNull
    private List<ZAIBaseChatContent> transferByAddress(String connId, String oneQuestId,
                                                       ZAIResponseDefinition definition, UserVo userInfo, ArrayList<ZAIBaseChatContent> trs, Integer type, UserVo targetUserInfo) {

        String targetUsername = Objects.nonNull(targetUserInfo) ? targetUserInfo.getUserName() : null;
        BigInteger targetUserId = Objects.nonNull(targetUserInfo) ? targetUserInfo.getTgUserId() : null;

        BigInteger tgUserId = userInfo.getTgUserId();

        String tokenName = definition.getTokenName().toLowerCase();
/*        CompletableFuture<Void> preHandle = CompletableFuture
            .runAsync(() -> userTokenSyncService.syncUserAccount(tgUserId, userInfo.getAddress()), executor);
        userTokenSyncService.syncUserTokenListNew(tgUserId, userInfo.getAddress());
        preHandle.join();*/
        UserTokenVo findInfo = new UserTokenVo();
        ZAITextChatContent zaiTextChatContent = checkToken(findInfo, tgUserId, definition, oneQuestId);
        if (Objects.nonNull(zaiTextChatContent)) {
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(zaiTextChatContent));
            return Collections.singletonList(zaiTextChatContent);
        }
        if (StringUtils.equals(findInfo.getAddress(), TokenAddressConstant.SOL_ADDRESS)) {
            findInfo.setAddress(TokenAddressConstant.WSOL_ADDRESS);
        }
        // tokenInfo
        ZAITransferTokenInfoContent tokenInfo = ZAITransferTokenInfoContent.builder().symbol(findInfo.getSymbol())
                .amount(findInfo.getAmount()).decimals(findInfo.getDecimals()).imageUrl(findInfo.getImage())
                .name(findInfo.getName()).text(String.format(HAVE_TOKENS,
                        CommonUtils.getTokens(findInfo.getAmount(), findInfo.getDecimals()), findInfo.getSymbol()))
                .network(findInfo.getNetwork())
                .build();
        tokenInfo.setAction(ChatActionEnum.TOKEN_INFO.getAction());
        tokenInfo.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(tokenInfo));
        trs.add(tokenInfo);

        // check tokens
        ZAITransferBalanceCheckContent balanceCheck = ZAITransferBalanceCheckContent.builder().name(findInfo.getName())
                .symbol(findInfo.getSymbol()).imageUrl(findInfo.getImage()).needCoin(definition.getAmount())
                .userBalanceCoin(CommonUtils.getTokens(findInfo.getAmount(), findInfo.getDecimals())).network(findInfo.getNetwork())
                .build();
        balanceCheck.setAction(ChatActionEnum.BALANCE_CHECK.getAction());
        balanceCheck.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(balanceCheck));
        trs.add(balanceCheck);

        if (balanceCheck.getUserBalanceCoin().compareTo(definition.getAmount()) >= 0) {

            ZShotTransactionTransferWithTrusteeshipActive taActive =
                    ZShotTransactionTransferWithTrusteeshipActive.builder()
                            .fromAddress(StringUtils.equals(findInfo.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())
                                    ? userInfo.getUserWalletAddress().stream()
                                    .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork()))
                                    .findFirst().orElse(new UserWalletAddress()).getWalletAddress()
                                    : userInfo.getAddress())
                            .toAddress(definition.getTargetAddress()).mintAddress(findInfo.getAddress())
                            .amount(CommonUtils.getAmount(definition.getAmount(), findInfo.getDecimals()))
                            .changeBalance(definition.getAmount())
                            .decimals(findInfo.getDecimals())
                            .tgUserId(tgUserId.toString()).build();
            taActive.setActive("transfer");
            taActive.setNetwork(findInfo.getNetwork());

            String webBotTransactionLog =
                    String.format(RedisCacheConstant.WEBBOT_TRANSACTION_LOG, tgUserId, oneQuestId);
            redisUtil.setExSeconds(webBotTransactionLog, taActive, RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_8);

            ZAITransferConfirmationContent transferConfirmation =
                    ZAITransferConfirmationContent.builder().symbol(findInfo.getSymbol()).name(findInfo.getName())
                            .transferStatus(0).userAddress(userInfo.getAddress()).targetAccount(definition.getTargetAddress())
                            .userAmount(CommonUtils.getTokens(findInfo.getAmount(), findInfo.getDecimals()))
                            .needAmount(definition.getAmount()).text("")
                            .type(type).targetUsername(targetUsername)
                            .targetUserId(targetUserId)
                            .network(findInfo.getNetwork())
                            .build();
            transferConfirmation.setAction(ChatActionEnum.TRANSFER_CONFIRMATION.getAction());
            transferConfirmation.setOneQuestId(oneQuestId);

            transferConfirmation.setCode(0);
            transferConfirmation.setMessage("");

            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(transferConfirmation));
            trs.add(transferConfirmation);
        } else {

            String alarm = String.format(BALANCE_CHECK_TRANSFER, balanceCheck.getSymbol(),
                    balanceCheck.getUserBalanceCoin(), balanceCheck.getSymbol(), definition.getAmount(),
                    balanceCheck.getSymbol(), balanceCheck.getSymbol());
            ZAITextChatContent build = ZAITextChatContent.builder().text(alarm).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            trs.add(build);
        }
        return trs;
    }



    private void statisticsSession(BigInteger tgUserId, Boolean newSession) {

        String sessionNew = String.format(RedisCacheConstant.LIMIT_SESSION_NEW, LocalDate.now(), tgUserId);
        String sessionNum = String.format(RedisCacheConstant.LIMIT_SESSION_NUM, LocalDate.now(), tgUserId);
        if (BooleanUtils.isTrue(newSession)) {
            redisUtil.increment(sessionNew, 1L, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_1);
        } else {
            redisUtil.increment(sessionNum, 1L, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_1);
        }
    }


    @NotNull
    private List<ZAIBaseChatContent> tokenInfo(String connId, String oneQuestId, ZAIResponseDefinition definition) {
        ZAIBaseChatContent chatContent;
        String ca = definition.getCa();
        List<ZAIBaseChatContent> resp = new ArrayList<>();
        String network = tokenSearchService.tokenNetwork(definition.getCa());
        ZAITextChatContent checkAddress = checkAddress(connId, oneQuestId, network);
        if (Objects.nonNull(checkAddress)) {
            resp.add(checkAddress);
            return resp;
        }

        CompletableFuture<List<TokenTendencyMaxVo>> kLine =
            CompletableFuture.supplyAsync(() -> tokenTendencyHandleService.oneDay(ca, Boolean.TRUE), executor);

        SmarterTonBalanceMessage smarterTonBalanceMessage = smartWalletService.buildSendMsg4WebBot(ca);
        String msg = smartWalletService.buildSmartSearchAddress4WebBot(smarterTonBalanceMessage);

        ZAITextAndOHLCChatContent.InfoDetail infoDetail = new ZAITextAndOHLCChatContent.InfoDetail();
        smartWalletService.buildInfoDetail(smarterTonBalanceMessage, infoDetail);
        infoDetail.setWhalesProbability("");

        infoDetail.setNetwork(network);
        List<TokenTendencyMaxVo> tokenTendencyMaxVos = kLine.join();
        chatContent = ZAITextAndOHLCChatContent.builder().symbol("$" + smarterTonBalanceMessage.getSymbol())
            .imageUrl(smarterTonBalanceMessage.getImageUrl()).name(smarterTonBalanceMessage.getName()).text(msg)
            .infoDetail(infoDetail).network(network).list(tokenTendencyMaxVos).build();
        chatContent.setAction(ChatActionEnum.TOKEN_DETAIL_HTML.getAction());
        chatContent.setOneQuestId(oneQuestId);
        log.info("tokenInfo send start");
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(chatContent));
        log.info("tokenInfo send end");
        resp.add(chatContent);
        return resp;
    }

    private ZAITextChatContent checkAddress(String connId, String oneQuestId, String network) {
        if (StringUtils.isEmpty(network) || !StringUtils.equalsAnyIgnoreCase(network,
            TokenNetWorkEnum.SOLANA.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(NOT_FIND_TOKEN).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            return build;
        }
        return null;
    }

    @Nullable
    private List<ZAIBaseChatContent> checkAddressPre(String connId, String oneQuestId,
        ZAIResponseDefinition definition) {

        if (Objects.nonNull(definition) && StringUtils.isNotEmpty(definition.getTargetAddress())
            && !TokenAddressValidator.isValidSolanaAddress(definition.getTargetAddress())
            && !TokenAddressValidator.isValidBscAddress(definition.getTargetAddress())) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(CHECK_ADDRESS_TARGET_TEXT).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            return Collections.singletonList(build);
        }
        if (Objects.nonNull(definition) && StringUtils.isNotEmpty(definition.getCa())
            && StringUtils.equalsAnyIgnoreCase(definition.getAction(), "analyze", "info")
            && !TokenAddressValidator.isValidSolanaAddress(definition.getCa())
            && !TokenAddressValidator.isValidBscAddress(definition.getCa())) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(CHECK_ADDRESS_ANALYZE_TEXT).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            return Collections.singletonList(build);
        }
        return null;
    }

    @NotNull
    private ArrayList<ZAIBaseChatContent> topUpInfo(String connId, String oneQuestId, UserVo userInfo) {
        ZAIBaseChatContent chatContent;
        ArrayList<ZAIBaseChatContent> topUp = Lists.newArrayList();
        ZAITTopUpContent topUpInfo = ZAITTopUpContent.builder().address(userInfo.getAddress()).build();
        topUpInfo.setAction(ChatActionEnum.TOP_UP.getAction());
        topUpInfo.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(topUpInfo));
        topUp.add(topUpInfo);

        chatContent = ZAITextChatContent.builder()
            .text(String.format(TOP_UP,
                "solana:" + userInfo.getAddress() + "\n" + "bsc:"
                    + userInfo.getUserWalletAddress().stream()
                        .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
                        .orElse(new UserWalletAddress()).getWalletAddress()))
            .build();
        chatContent.setAction(ChatActionEnum.TEXT.getAction());
        chatContent.setOneQuestId(oneQuestId);
        BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(chatContent));
        topUp.add(chatContent);
        return topUp;
    }

    private ZAITextChatContent checkSameChain(String connId, String oneQuestId, String network, String type) {
        if ((StringUtils.equals(network, TokenNetWorkEnum.SOLANA.getNetwork())
            && !StringUtils.equalsIgnoreCase(type, "SOL"))
            || (StringUtils.equals(network, TokenNetWorkEnum.BSC.getNetwork())
                && !StringUtils.equalsIgnoreCase(type, "BNB"))) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(NOT_SAME_CHAIN).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            BaseSseEmitterServerUtil.sendMessage(connId, jsonUtil.obj2String(build));
            return build;
        }

        return null;
    }

    private ZAITransferTokenInfoContent getTokenInfo(String address, BigInteger tgUserId) {
        UserTokenVo userTokenVo = userTokenService.queryByAddressAndTgUserId(tgUserId, address);
        if (Objects.nonNull(userTokenVo)) {

            return ZAITransferTokenInfoContent.builder().symbol(userTokenVo.getSymbol()).amount(userTokenVo.getAmount())
                .decimals(userTokenVo.getDecimals()).imageUrl(userTokenVo.getImage()).name(userTokenVo.getName())
                .network(userTokenVo.getNetwork())
                .text(String.format(HAVE_TOKENS,
                    CommonUtils.getTokens(userTokenVo.getAmount(), userTokenVo.getDecimals()), userTokenVo.getSymbol()))
                .build();
        }

        TokenDetailVo tokenDetailVo = tokenDetailService.queryCacheWithAsync(address);
        if (Objects.nonNull(tokenDetailVo)) {
            return ZAITransferTokenInfoContent.builder().symbol(tokenDetailVo.getSymbol()).amount(BigInteger.ZERO)
                .imageUrl(tokenDetailVo.getImage()).name(tokenDetailVo.getName()).network(tokenDetailVo.getNetwork())
                .text(String.format(NOT_HAVE_TOKENS, tokenDetailVo.getSymbol())).build();
        }

        return new ZAITransferTokenInfoContent();
    }

    private ZAITransferBalanceCheckContent checkBalanceByNetwork(String network, BigInteger tgUserId,
        BigDecimal needAmount) {
        if (StringUtils.equalsIgnoreCase(network, TokenNetWorkEnum.BSC.getNetwork())) {
            return checkBNBBalance(tgUserId, needAmount);
        }
        return checkSolBalance(tgUserId, needAmount);
    }

    private ZAITransferBalanceCheckContent checkSolBalance(BigInteger tgUserId, BigDecimal needSol) {
        UserVo userByTgUserId = userService.getUserByTgUserId(tgUserId);

        if (Objects.isNull(userByTgUserId)) {
            return new ZAITransferBalanceCheckContent();
        }

        BigDecimal balanceSol =
            CommonUtils.getTokens(BigInteger.valueOf(userByTgUserId.getLamports()), TokenAddressConstant.SOL_DECIMALS);

        return ZAITransferBalanceCheckContent.builder().name(TokenAddressConstant.SOL_NAME)
            .symbol(TokenAddressConstant.SOL_SYMBOL).imageUrl(TokenAddressConstant.SOL_IMAGE).needCoin(needSol)
            .network(TokenNetWorkEnum.SOLANA.getNetwork()).userBalanceCoin(balanceSol).build();
    }

    private ZAITransferBalanceCheckContent checkBNBBalance(BigInteger tgUserId, BigDecimal needBbn) {
        UserVo userByTgUserId = userService.getUserByTgUserId(tgUserId);

        if (Objects.isNull(userByTgUserId)) {
            return new ZAITransferBalanceCheckContent();
        }
        UserWalletAddress userWalletAddress = userByTgUserId.getUserWalletAddress().stream()
            .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
            .orElse(null);
        BigDecimal balanceCoin = BigDecimal.ZERO;
        if (Objects.nonNull(userWalletAddress)) {

            balanceCoin = CommonUtils.getTokens(userWalletAddress.getBalance(), userWalletAddress.getDecimals());
        }

        return ZAITransferBalanceCheckContent.builder().name(BscAddressConstant.BNB_NAME)
            .symbol(BscAddressConstant.BNB_SYMBOL).symbol(BscAddressConstant.BNB_SYMBOL)
            .imageUrl(BscAddressConstant.WBNB_IMAGE).needCoin(needBbn).network(TokenNetWorkEnum.BSC.getNetwork())
            .userBalanceCoin(balanceCoin).build();
    }

    private ZShotTransactionSwapWithTrusteeshipActive buyByNetWork(UserVo userInfo, String ca, String network,
        ZAITransferBalanceCheckContent balanceCheck) {

        if (StringUtils.equalsIgnoreCase(network, TokenNetWorkEnum.BSC.getNetwork())) {
            String walletAddress = userInfo.getUserWalletAddress().stream()
                .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
                .orElse(new UserWalletAddress()).getWalletAddress();
            return ZShotTransactionSwapWithTrusteeshipActive.builder().ownerAddress(walletAddress)
                .inputMintAddress(BscAddressConstant.BNB_ADDRESS).inputMintDecimals(BscAddressConstant.WBNB_DECIMALS)
                .price(priceTokens(BscAddressConstant.WBNB_ADDRESS))
                .amount(CommonUtils.getAmount(balanceCheck.getNeedCoin(), BscAddressConstant.WBNB_DECIMALS))
                .changeBalance(balanceCheck.getNeedCoin()).outputMintAddress(ca)
                .slippageBps(slippageService.buySlippage(userInfo.getTgUserId()))
                .tgUserId(String.valueOf(userInfo.getTgUserId())).superiorsAddress(userInfo.getSuperiorsAddress())
                .build();
        }

        return ZShotTransactionSwapWithTrusteeshipActive.builder().ownerAddress(userInfo.getAddress())
            .inputMintAddress(TokenAddressConstant.WSOL_ADDRESS).inputMintDecimals(TokenAddressConstant.SOL_DECIMALS)
            .price(priceTokens(TokenAddressConstant.WSOL_ADDRESS))
            .amount(CommonUtils.getAmount(balanceCheck.getNeedCoin(), TokenAddressConstant.SOL_DECIMALS))
            .changeBalance(balanceCheck.getNeedCoin()).outputMintAddress(ca)
            .slippageBps(slippageService.buySlippage(userInfo.getTgUserId()))
            .tgUserId(String.valueOf(userInfo.getTgUserId())).superiorsAddress(userInfo.getSuperiorsAddress()).build();
    }

    private ZShotTransactionSwapWithTrusteeshipActive sellByNetWork(ZAIResponseDefinition definition, UserVo userInfo,
        String network, ZAITransferTokenInfoContent tokenInfo) {
        if (StringUtils.equalsIgnoreCase(network, TokenNetWorkEnum.BSC.getNetwork())) {
            String walletAddress = userInfo.getUserWalletAddress().stream()
                .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
                .orElse(new UserWalletAddress()).getWalletAddress();
            return ZShotTransactionSwapWithTrusteeshipActive.builder().ownerAddress(walletAddress)
                .inputMintAddress(definition.getCa()).inputMintDecimals(tokenInfo.getDecimals())
                .price(priceTokens(definition.getCa()))
                .amount(CommonUtils.getAmount(definition.getAmount(), tokenInfo.getDecimals()))
                .changeBalance(definition.getAmount()).outputMintAddress(BscAddressConstant.BNB_ADDRESS)
                .slippageBps(slippageService.sellSlippage(userInfo.getTgUserId()))
                .tgUserId(String.valueOf(userInfo.getTgUserId())).superiorsAddress(userInfo.getSuperiorsAddress())
                .build();
        }

        return ZShotTransactionSwapWithTrusteeshipActive.builder().ownerAddress(userInfo.getAddress())
            .inputMintAddress(definition.getCa()).inputMintDecimals(tokenInfo.getDecimals())
            .price(priceTokens(definition.getCa()))
            .amount(CommonUtils.getAmount(definition.getAmount(), tokenInfo.getDecimals()))
            .changeBalance(definition.getAmount()).outputMintAddress(TokenAddressConstant.WSOL_ADDRESS)
            .slippageBps(slippageService.sellSlippage(userInfo.getTgUserId()))
            .tgUserId(String.valueOf(userInfo.getTgUserId())).superiorsAddress(userInfo.getSuperiorsAddress()).build();
    }

    private ZAITextChatContent checkToken(UserTokenVo findInfoTemp, BigInteger tgUserId,
                                          ZAIResponseDefinition definition, String oneQuestId) {
        String tokenName = definition.getTokenName().toLowerCase();
        List<UserTokenVo> arrayList = new ArrayList<>();
        List<UserTokenVo> tokenLists = userTokenService.getTokenList(tgUserId, Boolean.TRUE);
        List<UserTokenVo> tokenListBsc = userTokenService.getTokenListBsc(tgUserId, Boolean.TRUE);
        arrayList.addAll(tokenLists);
        arrayList.addAll(tokenListBsc);

        UserTokenVo findInfo = arrayList.stream()
                .filter(s -> StringUtils.containsIgnoreCase(s.getName(), tokenName)
                        || StringUtils.containsIgnoreCase(s.getSymbol(), tokenName))
                .collect(Collectors.toList()).stream().findFirst().orElse(null);
        log.info("{} findInfo is {}, param is {}", tgUserId, findInfo, definition);
        if (Objects.isNull(findInfo)) {
            ZAITextChatContent build = ZAITextChatContent.builder()
                    .text("I couldn't find " + definition.getTokenName() + " in your account").build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            return build;
        }
        String network = tokenSearchService.tokenNetwork(findInfo.getAddress());
        if (!StringUtils.equalsIgnoreCase(network, TokenNetWorkEnum.BSC.getNetwork())
                && TokenAddressValidator.isValidBscAddress(definition.getTargetAddress())) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(NOT_SAME_CHAIN_TRANSFERS).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            return build;
        }
        if (!StringUtils.equalsIgnoreCase(network, TokenNetWorkEnum.SOLANA.getNetwork())
                && TokenAddressValidator.isValidSolanaAddress(definition.getTargetAddress())) {
            ZAITextChatContent build = ZAITextChatContent.builder().text(NOT_SAME_CHAIN_TRANSFERS).build();
            build.setAction(ChatActionEnum.TEXT.getAction());
            build.setOneQuestId(oneQuestId);
            return build;
        }
        findInfo.setNetwork(network);
        BeanUtils.copyProperties(findInfo, findInfoTemp);

        return null;
    }
}
