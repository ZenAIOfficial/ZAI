package cn.z.zai.service.impl;

import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.KafkaCommonMsgTypeEnum;
import cn.z.zai.common.enums.TokenNetWorkEnum;
import cn.z.zai.dto.entity.UserAccountTransactionHistory;
import cn.z.zai.dto.entity.UserToken;
import cn.z.zai.dto.entity.UserWalletAddress;
import cn.z.zai.dto.request.EtherScanAccountTokenBalanceReq;
import cn.z.zai.dto.request.EtherScanAccountTokentxReq;
import cn.z.zai.dto.request.EtherScanAccountTxlistReq;
import cn.z.zai.dto.response.EtherScanAccountTokentxResp;
import cn.z.zai.dto.response.EtherScanAccountTxlistResp;
import cn.z.zai.dto.response.QuickNodeResponseBalance;
import cn.z.zai.dto.response.QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo;
import cn.z.zai.dto.response.QuickNodeResponseTransactionReceipt;
import cn.z.zai.dto.response.QuickNodeSignatureInformation;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.dto.vo.kafka.KafkaCommonMsgVo;
import cn.z.zai.mq.producer.TokenProducer;
import cn.z.zai.mq.producer.UserTokenTransactionProducer;
import cn.z.zai.service.TokenSyncService;
import cn.z.zai.service.UserAccountTransactionHistoryService;
import cn.z.zai.service.UserService;
import cn.z.zai.service.UserTokenService;
import cn.z.zai.service.UserTokenSyncService;
import cn.z.zai.util.JsonUtil;
import cn.z.zai.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.TreeSet;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserTokenSyncServiceImpl implements UserTokenSyncService {

    private static final String TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    @Autowired
    private JsonUtil jsonUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private TokenSyncService tokenSyncService;

    @Autowired
    private QuickNodeApi quickNodeApi;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private TokenProducer tokenProducer;

    @Autowired
    private BSCScanApi bscScanApi;

    @Autowired
    private QuickNodeBSCApi quickNodeBSCApi;

    @Autowired
    private UserTokenTransactionProducer userTokenTransactionProducer;

    @Autowired
    private UserAccountTransactionHistoryService userAccountTransactionHistoryService;

    @Override
    public void syncUserAccount(BigInteger tgUserId) {
        UserVo userVo = userService.getUserByTgUserId(tgUserId);

        Boolean updateSol = updateSol(userVo);

        Boolean updateBsc = updateBsc(userVo);

        if (BooleanUtils.isTrue(updateSol) || BooleanUtils.isTrue(updateBsc)) {
            userTokenTransactionProducer.sendUserTokenTransaction(tgUserId);
        }
    }

    @Override
    public void syncUserTokenListNew(BigInteger tgUserId) {
        UserVo userVo = userService.getUserByTgUserId(tgUserId);

        processSolanaTokens(userVo);

        // bscTokens
        processBscTokens(userVo);
    }

    @Override
    public void syncUserAccountTransactionHistoryList(BigInteger tgUserId) {

        /**
         * solana
         */
        processSolanaTxHistory(tgUserId);
        /**
         * bsc
         */
        processBscTxHistory(tgUserId);
    }

    private void processSolanaTxHistory(BigInteger tgUserId) {

        UserVo userVo = userService.getUserByTgUserId(tgUserId);
        String address = userVo.getAddress();
        if (StringUtils.isEmpty(address)) {
            return;
        }
        String lock =
            String.format(RedisCacheConstant.SYNC_SIGNATURES_LOCK, tgUserId, TokenNetWorkEnum.SOLANA.getNetwork());

        if (!redisUtil.setIfAbsent(lock, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_30, TimeUnit.SECONDS)) {
            return;
        }

        try {

            List<QuickNodeSignatureInformation> allList = new ArrayList<>();

            String until = userAccountTransactionHistoryService.transIdCache(tgUserId);

            String before = null;
            boolean flag;
            do {
                List<QuickNodeSignatureInformation> signaturesForAddress =
                    quickNodeApi.getSignaturesForAddress(address, before, until);

                if (CollectionUtils.size(signaturesForAddress) == 1000) {

                    flag = Boolean.TRUE;
                    before = signaturesForAddress.get(999).getSignature();
                } else {
                    flag = Boolean.FALSE;
                }

                if (CollectionUtils.isNotEmpty(signaturesForAddress)) {
                    allList.addAll(signaturesForAddress);
                }

            } while (flag);
            String lastSignature = null;
            if (!CollectionUtils.isEmpty(allList)) {
                lastSignature = allList.get(0).getSignature();
            }

            if (CollectionUtils.isEmpty(allList)) {
                return;
            }

            List<QuickNodeSignatureInformation> distinctList = allList.stream()
                .collect(Collectors.collectingAndThen(
                    Collectors.toCollection(
                        () -> new TreeSet<>(Comparator.comparing(QuickNodeSignatureInformation::getSignature))),
                    ArrayList::new))
                .stream().sorted(Comparator.comparing(QuickNodeSignatureInformation::getBlockTime))
                .collect(Collectors.toList());
            for (QuickNodeSignatureInformation forAddress : distinctList) {
                if (StringUtils.isEmpty(forAddress.getSignature()) || Objects.nonNull(forAddress.getErr())) {
                    continue;
                }
                UserAccountTransactionHistory userAccountTransactionHistory = new UserAccountTransactionHistory();
                userAccountTransactionHistory.setNetwork(TokenNetWorkEnum.SOLANA.getNetwork());
                userAccountTransactionHistory.setTgUserId(tgUserId);

                if (StringUtils.isNotEmpty(userAccountTransactionHistory.getTransId())) {

                    try {
                        userAccountTransactionHistoryService.addHistory(userAccountTransactionHistory);
                    } catch (DuplicateKeyException e) {
                        log.error("accountTransactionHistory add DuplicateKeyException user is {}, transId is {}",
                            tgUserId, userAccountTransactionHistory.getTransId());
                    }

                } else {
                    log.warn("accountTransactionHistory add get is exit param is {}", userAccountTransactionHistory);
                }

            }
            if (StringUtils.isNotEmpty(lastSignature)) {
                String untilKey = String.format(RedisCacheConstant.SIGNATURES_FOR_ADDRESS, tgUserId);
                redisUtil.setExSeconds(untilKey, lastSignature, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_3);
            }
        } catch (Exception e) {
            log.error("accountTransactionHistory error who is {}, message is {}", tgUserId, e.getMessage());
            log.error("accountTransactionHistory error who is {}, detail is ", tgUserId, e);
        } finally {
            redisUtil.setEx(lock, "1", RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5, TimeUnit.SECONDS);
        }
    }

    private void processBscTxHistory(BigInteger tgUserId) {
        UserVo userVo = userService.getUserByTgUserId(tgUserId);
        UserWalletAddress userWalletAddress = userVo.getUserWalletAddress().stream()
            .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
            .orElse(new UserWalletAddress());
        if (StringUtils.isEmpty(userWalletAddress.getWalletAddress())) {
            return;
        }
        String lock =
            String.format(RedisCacheConstant.SYNC_SIGNATURES_LOCK, tgUserId, TokenNetWorkEnum.BSC.getNetwork());

        if (!redisUtil.setIfAbsent(lock, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_30, TimeUnit.SECONDS)) {
            return;
        }

        try {
            String startblock = "0";

            String newStartblock = startblock;
            List<EtherScanAccountTxlistResp> txlist = getEtherScanAccountTxlistResps(userWalletAddress, startblock);

            if (CollectionUtils.isEmpty(txlist)) {
                return;
            }
            newStartblock = txlist.get(0).getBlockNumber();

            List<EtherScanAccountTokentxResp> tokentx = getEtherScanAccountTokentxResps(userWalletAddress, startblock);
            Map<String,
                EtherScanAccountTokentxResp> tokenTxMap = Optional.of(tokentx)
                    .map(s -> tokentx.stream().collect(
                        Collectors.toMap(EtherScanAccountTokentxResp::getHash, Function.identity(), (k1, k2) -> k2)))
                    .orElse(new HashMap<>());

            List<EtherScanAccountTxlistResp> distinctList = txlist.stream()
                .collect(Collectors.collectingAndThen(
                    Collectors
                        .toCollection(() -> new TreeSet<>(Comparator.comparing(EtherScanAccountTxlistResp::getHash))),
                    ArrayList::new))
                .stream().sorted(Comparator.comparing(EtherScanAccountTxlistResp::getTimeStamp))
                .collect(Collectors.toList());
            for (EtherScanAccountTxlistResp etherScanAccountTxlistResp : distinctList) {
                UserAccountTransactionHistory userAccountTransactionHistory = new UserAccountTransactionHistory();
                userAccountTransactionHistory.setNetwork(TokenNetWorkEnum.BSC.getNetwork());
                userAccountTransactionHistory.setTgUserId(tgUserId);
                if (!"0".equals(etherScanAccountTxlistResp.getIsError())) {
                    continue;
                }

                boolean isContractInteraction = !"0x".equals(etherScanAccountTxlistResp.getInput());
                if (isContractInteraction) {
                    EtherScanAccountTokentxResp token = tokenTxMap.get(etherScanAccountTxlistResp.getHash());
                    if (Objects.isNull(token)) {
                        if (StringUtils.equalsIgnoreCase(etherScanAccountTxlistResp.getMethodId(), "0xa9059cbb")) {
                            log.error("processBscTxHistory  query tokenTx empty1");
                            return;
                        }

                        QuickNodeResponseTransactionReceipt receipt =
                            quickNodeBSCApi.ethGetTransactionReceipt(etherScanAccountTxlistResp.getHash());
                        if (Objects.nonNull(receipt)
                            && receipt.getLogs().stream().anyMatch(log -> log.getTopics().size() > 0
                                && TRANSFER_TOPIC.equalsIgnoreCase(log.getTopics().get(0)))) {
                            log.error("processBscTxHistory  query tokenTx empty2");
                            return;
                        }

                    }
                }

                String transId =
                    userAccountTransactionHistoryService.getTransId(tgUserId, etherScanAccountTxlistResp.getHash());
                if (StringUtils.isEmpty(transId) && StringUtils.isNotEmpty(userAccountTransactionHistory.getTransId())
                    && Objects.nonNull(userAccountTransactionHistory.getTransType())) {

                    try {
                        userAccountTransactionHistoryService.addHistory(userAccountTransactionHistory);
                    } catch (DuplicateKeyException e) {
                        log.error("processBscTxHistory add DuplicateKeyException user is {}, transId is {}", tgUserId,
                            userAccountTransactionHistory.getTransId());
                    }

                } else {
                    log.warn("processBscTxHistory add get is exit param is {}", userAccountTransactionHistory);
                }
            }
            // add
        } finally {
            redisUtil.expire(lock, RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5, TimeUnit.SECONDS);
        }

    }

    private void processSolanaTokens(UserVo userVo) {
        if (StringUtils.isEmpty(userVo.getAddress())) {
            return;
        }
        String lockKey = String.format(RedisCacheConstant.SYNC_TOKENS_LOCK, userVo.getTgUserId(),
            TokenNetWorkEnum.SOLANA.getNetwork());
        if (!redisUtil.setIfAbsent(lockKey, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_30, TimeUnit.SECONDS)) {
            return;
        }
        try {
            List<QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo> list =
                tokenSyncService.syncAccountTokens(userVo.getAddress());
            if (CollectionUtils.isNotEmpty(list)) {
                List<UserToken> userTokenList = new ArrayList<>();
                for (QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo item : list) {
                    if (item == null || !userVo.getAddress().equals(item.getOwner()) || item.getTokenAmount() == null
                        || StringUtils.isEmpty(item.getTokenAmount().getAmount())) {
                        log.info("[syncAccountTokens] quickNode response item is null,walletAddress={},item={}",
                            userVo.getAddress(), jsonUtil.obj2String(item));
                        continue;
                    }
                    UserToken userToken = new UserToken();
                    userToken.setNetwork(TokenNetWorkEnum.SOLANA.getNetwork());
                    userToken.setTgUserId(userVo.getTgUserId());
                    userToken.setAddress(item.getMint());
                    userToken.setAmount(new BigInteger(item.getTokenAmount().getAmount()));
                    userTokenList.add(userToken);
                }
                if (userTokenList.size() > 0) {
                    // solana
                    userTokenService.insertTokenList(userTokenList, userVo.getTgUserId());
                    for (UserToken userToken : userTokenList) {
                        tokenProducer.sendTokenProcessData(
                            KafkaCommonMsgVo.builder().type(KafkaCommonMsgTypeEnum.INIT_TOKEN.getType())
                                .processData(userToken.getAddress()).build());
                    }
                }
            }
        } finally {

            redisUtil.expire(lockKey, RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5, TimeUnit.SECONDS);
        }

    }

    public void processBscTokens(UserVo userVo) {
        List<UserWalletAddress> userWalletAddress = userVo.getUserWalletAddress();
        UserWalletAddress walletAddress4Bsc = null;
        for (UserWalletAddress address : userWalletAddress) {
            if (StringUtils.equals(address.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())) {
                walletAddress4Bsc = address;
                break;
            }
        }
        if (Objects.isNull(walletAddress4Bsc)) {
            return;
        }
        String lockKey =
            String.format(RedisCacheConstant.SYNC_TOKENS_LOCK, userVo.getTgUserId(), TokenNetWorkEnum.BSC.getNetwork());
        if (!redisUtil.setIfAbsent(lockKey, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_30, TimeUnit.SECONDS)) {
            return;
        }
        try {

            String startblock = "0";

            String newStartblock = startblock;
            List<EtherScanAccountTokentxResp> all = getEtherScanAccountTokentxResps(walletAddress4Bsc, startblock);

            if (CollectionUtils.isEmpty(all)) {
                return;
            }
            newStartblock = all.get(0).getBlockNumber();
            List<String> collect = all.stream().map(EtherScanAccountTokentxResp::getContractAddress)
                .collect(Collectors.toList()).stream().distinct().collect(Collectors.toList());

            for (String contractaddress : collect) {
                EtherScanAccountTokenBalanceReq req = new EtherScanAccountTokenBalanceReq();

                req.setAddress(walletAddress4Bsc.getWalletAddress());
                req.setContractaddress(contractaddress);
                String balanceToken = null;
                for (int i = 0; i < 3; i++) {

                    balanceToken = bscScanApi.accountTokenBalance(req);
                    if (StringUtils.isNotEmpty(balanceToken)) {
                        break;
                    }
                }
                if (StringUtils.isEmpty(balanceToken)) {
                    continue;
                }
                if (new BigInteger(balanceToken).compareTo(BigInteger.ZERO) == 0) {

                    userTokenService.deleteTokenDetail(userVo.getTgUserId(), contractaddress,
                        TokenNetWorkEnum.BSC.getNetwork());
                } else {
                    UserToken userToken = new UserToken();
                    userToken.setNetwork(TokenNetWorkEnum.BSC.getNetwork());
                    userToken.setTgUserId(userVo.getTgUserId());
                    userToken.setAddress(contractaddress);
                    userToken.setAmount(new BigInteger(balanceToken));

                    userTokenService.addOrUpdate(userToken, userVo.getTgUserId());
                }

            }
            for (String address : collect) {
                tokenProducer.sendTokenProcessData(KafkaCommonMsgVo.builder()
                    .type(KafkaCommonMsgTypeEnum.INIT_TOKEN.getType()).processData(address).build());
            }
        } finally {

            redisUtil.expire(lockKey, RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5, TimeUnit.SECONDS);
        }

    }

    @NotNull
    private List<EtherScanAccountTokentxResp> getEtherScanAccountTokentxResps(UserWalletAddress walletAddress4Bsc,
        String startblock) {
        Integer page = 1;
        boolean flag = Boolean.FALSE;
        List<EtherScanAccountTokentxResp> all = new ArrayList<>();
        do {
            EtherScanAccountTokentxReq req = new EtherScanAccountTokentxReq();
            req.setAddress(walletAddress4Bsc.getWalletAddress());
            req.setStartblock(String.valueOf(Long.parseLong(startblock) + 1));
            req.setSort("desc");
            req.setOffset(500);
            req.setPage(page);
            List<EtherScanAccountTokentxResp> etherScanAccountTokentxResps = bscScanApi.accountTokentx(req);
            if (CollectionUtils.isNotEmpty(etherScanAccountTokentxResps)
                && CollectionUtils.size(etherScanAccountTokentxResps) == 500) {
                page++;
                flag = Boolean.TRUE;
            }
            if (CollectionUtils.isNotEmpty(etherScanAccountTokentxResps)) {
                all.addAll(etherScanAccountTokentxResps);
            }
        } while (flag);
        return all;
    }

    private boolean updateSol(UserVo userVo) {

        String lock = String.format(RedisCacheConstant.SYNC_BALANCE_LOCK, userVo.getTgUserId(),
            TokenNetWorkEnum.SOLANA.getNetwork());
        if (!redisUtil.setIfAbsent(lock, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_5, TimeUnit.SECONDS)) {
            return Boolean.FALSE;
        }

        try {
            QuickNodeResponseBalance response = quickNodeApi.getBalance(userVo.getAddress());
            if (response == null) {
                log.info("user wallet balance Sol is 0,tgUserId={},address={}", userVo.getTgUserId(),
                    userVo.getAddress());
                return Boolean.FALSE;
            }
            if (Objects.isNull(response.getValue())) {
                return Boolean.FALSE;
            }

            return userService.updateLamports(userVo.getTgUserId(), response.getValue());
        } finally {
            redisUtil.expire(lock, RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5, TimeUnit.SECONDS);
        }

    }

    private Boolean updateBsc(UserVo userVo) {

        String lock = String.format(RedisCacheConstant.SYNC_BALANCE_LOCK, userVo.getTgUserId(),
            TokenNetWorkEnum.BSC.getNetwork());
        if (!redisUtil.setIfAbsent(lock, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_5, TimeUnit.SECONDS)) {
            return Boolean.FALSE;
        }

        try {
            List<UserWalletAddress> userWalletAddress = userVo.getUserWalletAddress();
            if (CollectionUtils.isEmpty(userWalletAddress)) {
                return Boolean.FALSE;
            }
            UserWalletAddress walletAddress4Bsc = null;
            for (UserWalletAddress walletAddress : userWalletAddress) {
                if (StringUtils.equals(walletAddress.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())) {
                    walletAddress4Bsc = walletAddress;
                    break;
                }
            }
            if (Objects.isNull(walletAddress4Bsc)) {
                return Boolean.FALSE;
            }

            // hexadecimal
            String balanceWei = quickNodeBSCApi.getBalance(walletAddress4Bsc.getWalletAddress());
            if (StringUtils.isEmpty(balanceWei)) {
                log.info("user wallet balance Bsc is 0,tgUserId={},address={}", userVo.getTgUserId(),
                    userVo.getAddress());
                return Boolean.FALSE;
            }
            BigInteger wei = new BigInteger(balanceWei.substring(2), 16);

            log.info("user bsc change start,user is  {}, older bsc is {}, new bsc is {}", userVo.getTgUserId(),
                walletAddress4Bsc.getBalance(), wei);
            if (walletAddress4Bsc.getBalance().compareTo(wei) == 0) {
                return Boolean.FALSE;
            }
            log.info("user bsc change end,user is  {}, older bsc is {}, new bsc is {}", userVo.getTgUserId(),
                walletAddress4Bsc.getBalance(), wei);
            walletAddress4Bsc.setBalance(wei);
            // update user balance
            return Boolean.TRUE;
        } finally {
            redisUtil.expire(lock, RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5, TimeUnit.SECONDS);
        }

    }

    @NotNull
    private List<EtherScanAccountTxlistResp> getEtherScanAccountTxlistResps(UserWalletAddress userWalletAddress,
        String startblock) {
        Integer page = 1;
        boolean flag = Boolean.FALSE;
        List<EtherScanAccountTxlistResp> all = new ArrayList<>();
        do {
            EtherScanAccountTxlistReq req = new EtherScanAccountTxlistReq();
            req.setAddress(userWalletAddress.getWalletAddress());
            req.setStartblock(String.valueOf(Long.parseLong(startblock) + 1));
            req.setSort("desc");
            req.setOffset(500);
            req.setPage(page);
            List<EtherScanAccountTxlistResp> etherScanAccountTokentxResps = bscScanApi.accountTxlist(req);
            if (CollectionUtils.isNotEmpty(etherScanAccountTokentxResps)
                && CollectionUtils.size(etherScanAccountTokentxResps) == 500) {
                page++;
                flag = Boolean.TRUE;
            }
            if (CollectionUtils.isNotEmpty(etherScanAccountTokentxResps)) {
                all.addAll(etherScanAccountTokentxResps);
            }
        } while (flag);
        return all;
    }

}
