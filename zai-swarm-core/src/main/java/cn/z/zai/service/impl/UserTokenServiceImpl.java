package cn.z.zai.service.impl;

import cn.z.zai.common.constant.BscAddressConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.constant.TokenAddressConstant;
import cn.z.zai.common.enums.KafkaCommonMsgTypeEnum;
import cn.z.zai.common.enums.TokenNetWorkEnum;
import cn.z.zai.dao.UserTokenDao;
import cn.z.zai.dto.entity.UserToken;
import cn.z.zai.dto.entity.UserWalletAddress;
import cn.z.zai.dto.vo.UserTokenVo;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.dto.vo.kafka.KafkaCommonMsgVo;
import cn.z.zai.mq.producer.TokenProducer;
import cn.z.zai.mq.producer.UserTokenTransactionProducer;
import cn.z.zai.service.TokenDetailService;
import cn.z.zai.service.TokenSearchService;
import cn.z.zai.service.UserService;
import cn.z.zai.service.UserTokenService;
import cn.z.zai.service.UserTradeDelayedService;
import cn.z.zai.util.RedisUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.yaml.snakeyaml.constructor.DuplicateKeyException;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserTokenServiceImpl implements UserTokenService {

    @Autowired
    private UserTokenDao userTokenDao;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private TokenSearchService tokenSearchService;

    @Autowired
    private UserTradeDelayedService userTradeDelayedService;

    @Autowired
    private UserTokenTransactionProducer userTokenTransactionProducer;

    @Autowired
    private TokenProducer tokenProducer;

    @Autowired
    @Lazy
    private TokenDetailService tokenDetailService;

    @Override
    public UserTokenVo queryByAddressAndTgUserId(BigInteger tgUserId, String address) {
        List<UserTokenVo> tokenList = getTokenList(tgUserId, false);
        UserTokenVo userTokenVo = null;
        if (!CollectionUtils.isEmpty(tokenList)) {
            Optional<UserTokenVo> first = tokenList.stream().filter(e -> e.getAddress().equals(address)).findFirst();
            if (first.isPresent()) {
                userTokenVo = first.get();
            }
        }

        return userTokenVo;
    }

    @Override
    public List<UserTokenVo> getTokenList(BigInteger tgUserId, Boolean containSol) {

        List<UserTokenVo> userTokenList = getUserTokenList(tgUserId, TokenNetWorkEnum.SOLANA.getNetwork());

        List<String> addressList = new ArrayList<>();
        if (BooleanUtils.isTrue(containSol)) {
            UserVo userVo = userService.getUserByTgUserId(tgUserId);
            if (Objects.nonNull(userVo.getLamports()) && userVo.getLamports() >= 0) {
                BigDecimal value = tokenDetailService.tokenPriceLast(TokenAddressConstant.WSOL_ADDRESS);
                UserTokenVo tokenVo = new UserTokenVo();
                tokenVo.setNetwork(TokenNetWorkEnum.SOLANA.getNetwork());
                tokenVo.setAddress(TokenAddressConstant.SOL_ADDRESS);
                tokenVo.setDecimals(TokenAddressConstant.SOL_DECIMALS);
                tokenVo.setName(TokenAddressConstant.SOL_NAME);
                tokenVo.setSymbol(TokenAddressConstant.SOL_SYMBOL);
                tokenVo.setImage(TokenAddressConstant.SOL_IMAGE);
                tokenVo.setAmount(BigInteger.valueOf(userVo.getLamports()));
                tokenVo.setAmountStr(String.valueOf(userVo.getLamports()));
                tokenVo.setPrice(value);
                userTokenList.add(tokenVo);
            }
        }

        // update token price
        addressList = userTokenList.stream().map(UserTokenVo::getAddress).collect(Collectors.toList());
        if (containSol) {
            addressList.add(TokenAddressConstant.WSOL_ADDRESS);
        }
        addressList.forEach(address -> {
            tokenProducer.sendTokenPriceProcessData(KafkaCommonMsgVo.builder()
                .type(KafkaCommonMsgTypeEnum.SYNC_SINGLE_TOKEN_PRICE.getType()).processData(address).build());
        });

        return userTokenList;
    }

    @Override
    public List<UserTokenVo> getTokenListBsc(BigInteger tgUserId, Boolean containBsc) {

        List<UserTokenVo> userTokenList = getUserTokenList(tgUserId, TokenNetWorkEnum.BSC.getNetwork());

        List<String> addressList = new ArrayList<>();
        if (BooleanUtils.isTrue(containBsc)) {
            UserVo userVo = userService.getUserByTgUserId(tgUserId);
            UserWalletAddress userWalletAddress = userVo.getUserWalletAddress().stream()
                .filter(s -> StringUtils.equals(s.getNetwork(), TokenNetWorkEnum.BSC.getNetwork())).findFirst()
                .orElse(null);
            if (Objects.nonNull(userWalletAddress) && userWalletAddress.getBalance().compareTo(BigInteger.ZERO) >= 0) {
                BigDecimal value = tokenDetailService.tokenPriceLast(BscAddressConstant.WBNB_ADDRESS);
                UserTokenVo tokenVo = new UserTokenVo();
                tokenVo.setNetwork(TokenNetWorkEnum.BSC.getNetwork());
                tokenVo.setAddress(BscAddressConstant.BNB_ADDRESS);
                tokenVo.setDecimals(BscAddressConstant.WBNB_DECIMALS);
                tokenVo.setName(BscAddressConstant.BNB_NAME);
                tokenVo.setSymbol(BscAddressConstant.BNB_SYMBOL);
                tokenVo.setImage(BscAddressConstant.WBNB_IMAGE);
                tokenVo.setAmount(userWalletAddress.getBalance());
                tokenVo.setAmountStr(String.valueOf(userWalletAddress.getBalance()));
                tokenVo.setPrice(value);
                userTokenList.add(tokenVo);
            }
        }
        // update token price
        addressList = userTokenList.stream().map(UserTokenVo::getAddress).collect(Collectors.toList());

        addressList.forEach(address -> {
            tokenProducer.sendTokenPriceProcessData(KafkaCommonMsgVo.builder()
                .type(KafkaCommonMsgTypeEnum.SYNC_SINGLE_TOKEN_PRICE.getType()).processData(address).build());
        });

        return userTokenList;
    }

    @Override
    @Transactional
    public void insertTokenList(List<UserToken> tokenList, BigInteger tgUserId) {

        List<UserTokenVo> oldTokenList = getTokenList(tgUserId, false);
        boolean same = areListsEqual(oldTokenList, tokenList);
        if (!same) {
            String key = String.format(RedisCacheConstant.USER_TOKEN_LIST_UPDATE_KEY, tgUserId);
            if (!redisUtil.hasKey(key)) {
                try {
                    userTokenDao.deleteTokenList(tgUserId, TokenNetWorkEnum.SOLANA.getNetwork());
                    if (tokenList.size() > 0) {
                        List<UserToken> filteredList =
                            tokenList.stream().filter(token -> token.getAmount().compareTo(BigInteger.ZERO) != 0)
                                .collect(Collectors.toList());
                        if (filteredList.size() > 0) {
                            List<UserToken> collect = filteredList.stream()
                                .filter(s -> !StringUtils.equalsAny(s.getAddress(), TokenAddressConstant.SOL_ADDRESS,
                                    TokenAddressConstant.WSOL_ADDRESS, BscAddressConstant.WBNB_ADDRESS,
                                    BscAddressConstant.BNB_ADDRESS))
                                .collect(Collectors.toList());
                            if (org.apache.commons.collections4.CollectionUtils.isNotEmpty(collect)) {
                                userTokenDao.insertTokenList(collect);
                            }

                        }
                    }
                    redisUtil.delete(String.format(RedisCacheConstant.USER_TOKEN_LIST, tgUserId));
                } catch (Exception exception) {
                    log.error("insertTokenList exception {}", tgUserId, exception);
                }
            }
            userTokenTransactionProducer.sendUserTokenTransaction(tgUserId);
            userTradeDelayedService.triggerDelayedUserTokenHistory(tgUserId);
        }
    }

    @Override
    public void deleteTokenDetail(BigInteger tgUserId, String address, String network) {
        userTokenDao.deleteTokenDetail(tgUserId, address, network);
        redisUtil.delete(String.format(RedisCacheConstant.USER_TOKEN_LIST, tgUserId));
    }

    @Override
    public void addOrUpdate(UserToken userToken, BigInteger tgUserId) {

        UserTokenVo userTokenVo =
            userTokenDao.queryByAddressAndTgUserId(tgUserId, userToken.getAddress(), userToken.getNetwork());
        if (Objects.isNull(userTokenVo)) {

            try {
                if (StringUtils.equalsAny(userToken.getAddress(), TokenAddressConstant.SOL_ADDRESS,
                    TokenAddressConstant.WSOL_ADDRESS, BscAddressConstant.WBNB_ADDRESS,
                    BscAddressConstant.BNB_ADDRESS)) {
                    return;
                }
                userTokenDao.insertTokenList(Collections.singletonList(userToken));
            } catch (DuplicateKeyException e) {
                userTokenDao.batchUpdate(Collections.singletonList(userToken));
            }

        } else {
            userTokenDao.batchUpdate(Collections.singletonList(userToken));
        }
        redisUtil.delete(String.format(RedisCacheConstant.USER_TOKEN_LIST, tgUserId));
    }

    public static boolean areListsEqual(List<UserTokenVo> list1, List<UserToken> list2) {
        List<UserToken> convertList1 = list1.stream().map(vo -> {
            UserToken token = new UserToken();
            token.setAddress(vo.getAddress());
            token.setAmount(vo.getAmount());
            return token;
        }).collect(Collectors.toList());

        Function<UserToken, List<Object>> compositeKey = token -> Arrays.asList(token.getAddress(), token.getAmount());

        Set<List<Object>> set1 = convertList1.stream().map(compositeKey).collect(Collectors.toSet());
        Set<List<Object>> set2 = list2.stream().map(compositeKey).collect(Collectors.toSet());

        return set1.equals(set2);
    }

    @NotNull
    private List<UserTokenVo> getUserTokenList(BigInteger tgUserId, String network) {
        List<UserTokenVo> userTokenList = redisUtil.get(String.format(RedisCacheConstant.USER_TOKEN_LIST, tgUserId),
            new TypeReference<List<UserTokenVo>>() {});
        if (userTokenList == null) {
            userTokenList = userTokenDao.getTokenList(tgUserId, null);
            if (userTokenList.size() > 0) {
                redisUtil.set(String.format(RedisCacheConstant.USER_TOKEN_LIST, tgUserId), userTokenList,
                    RedisCacheConstant.EXPIRE_TIME_OUT_DAY_1);
            }
        }
        if (userTokenList.size() > 0) {
            List<String> addressList = userTokenList.stream().map(UserTokenVo::getAddress).collect(Collectors.toList());
            Map<String, BigDecimal> tokenPriceMap = tokenDetailService.tokenPriceLast(addressList);
            userTokenList.forEach(item -> {
                BigDecimal price = tokenPriceMap.get(item.getAddress());
                if (price != null) {
                    item.setPrice(price);
                }
                item.setAmountStr(String.valueOf(item.getAmount()));
            });
        }
        if (org.apache.commons.collections4.CollectionUtils.isEmpty(userTokenList)) {
            return userTokenList;
        }
        Map<String, List<UserTokenVo>> collect = userTokenList.stream().peek(s -> {
            if (StringUtils.isEmpty(s.getNetwork())) {
                s.setNetwork(tokenSearchService.tokenNetwork(s.getAddress()));
            }
        }).collect(Collectors.groupingBy(UserTokenVo::getNetwork));

        return collect.getOrDefault(network, new ArrayList<>());
    }
}
