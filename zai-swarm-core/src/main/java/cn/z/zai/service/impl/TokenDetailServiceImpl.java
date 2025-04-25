package cn.z.zai.service.impl;

import cn.z.zai.common.constant.ErrorConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.HomeTokenTabTypeEnum;
import cn.z.zai.common.enums.KafkaCommonMsgTypeEnum;
import cn.z.zai.dao.TokenDetailDao;
import cn.z.zai.dto.so.TokenDetailSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenDetailWithSecurityVo;
import cn.z.zai.dto.vo.TokenDetailWithUserTokenVo;
import cn.z.zai.dto.vo.TokenTrendingVo;
import cn.z.zai.dto.vo.UserTokenVo;
import cn.z.zai.dto.vo.UserTokenWatchVo;
import cn.z.zai.dto.vo.kafka.KafkaCommonMsgVo;
import cn.z.zai.exception.BaseException;
import cn.z.zai.mq.producer.TokenProducer;
import cn.z.zai.service.TokenDetailService;
import cn.z.zai.service.TokenSecurityDetailService;
import cn.z.zai.service.TokenSyncService;
import cn.z.zai.service.TokenTrendingService;
import cn.z.zai.service.UserTokenService;
import cn.z.zai.service.UserTokenWatchService;
import cn.z.zai.util.ContextHolder;
import cn.z.zai.util.RedisUtil;
import cn.z.zai.util.TokenAddressValidator;
import com.github.pagehelper.PageInfo;
import com.github.pagehelper.page.PageMethod;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TokenDetailServiceImpl implements TokenDetailService {
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private TokenDetailDao dao;

    @Autowired
    @Lazy
    private TokenSyncService tokenSyncService;

    @Autowired
    private TokenProducer tokenProducer;

    @Autowired
    private UserTokenWatchService userTokenWatchService;

    @Autowired
    @Lazy
    private TokenDetailService self;

    @Autowired
    private UserTokenService userTokenService;

    @Autowired
    private TokenSecurityDetailService tokenSecurityDetailService;

    @Autowired
    private TokenTrendingService tokenTrendingService;
    @Autowired
    @Qualifier("sendMessageExecutor")
    private Executor executor;

    @Override
    public Map<String, BigDecimal> tokenPriceLast(List<String> addressList) {
        Map<String, BigDecimal> map = Maps.newHashMap();
        for (String address : addressList) {
            BigDecimal price = tokenPriceLast(address);
            if (price != null) {
                map.put(address, price);
            }
        }
        return map;
    }

    @Override
    public BigDecimal tokenPriceLast(String address) {
        try {
            self.sendMsg4UpdateTokenDetailLastShowDetailTime(address);
            String cacheKey = String.format(RedisCacheConstant.BIRD_EYE_PRICE_MULTIPLE_KEY, address);
            BigDecimal price = redisUtil.get(cacheKey, BigDecimal.class);
            if (price == null) {
                TokenDetailVo vo = queryWithCache(address);
                if (vo == null) {
                    vo = tokenSyncService.syncTokenByAddressNew(address);
                }
                if (vo != null) {
                    price = vo.getPrice();
                }
            }
            return price;
        } catch (Exception e) {
            log.error("Method [tokenPriceLast] ERROR: {}", address, e);
        }
        return null;
    }

    private void packagePrice(List<? extends TokenDetailVo> cacheList) {
        if (!CollectionUtils.isEmpty(cacheList)) {
            for (TokenDetailVo vo : cacheList) {
                String cacheKey = String.format(RedisCacheConstant.BIRD_EYE_PRICE_MULTIPLE_KEY, vo.getAddress());
                BigDecimal price = redisUtil.get(cacheKey, BigDecimal.class);
                if (price != null) {
                    vo.setPrice(price);
                    if (vo.getTotalSupply() != null && vo.getTotalSupply().compareTo(BigDecimal.ZERO) > 0) {
                        vo.setMktCap(vo.getPrice().multiply(vo.getTotalSupply()));
                    }
                }
                self.sendMsg4UpdateTokenDetailLastShowDetailTime(vo.getAddress());

            }
        }
    }

    @Override
    public Boolean saveTokenDetail(TokenDetailVo vo) {
        processValueDecimal(Lists.newArrayList(vo));
        TokenDetailVo tokenDetailVo = queryWithCache(vo.getAddress());

        if (tokenDetailVo == null) {
            addTokenDetail(vo);
            try {
                tokenSecurityDetailService.insertTokenSecurity(vo.getAddress());
            } catch (Exception e) {
                log.error("cn.z.zai.service.TokenSecurityDetailService.insertTokenSecurity ERROR :", e);
            }
            String key = String.format(RedisCacheConstant.TOKEN_DETAIL_KEY, vo.getAddress());
            redisUtil.set(key, vo, RedisCacheConstant.TOKEN_DETAIL_KEY_TIMEOUT);
        } else {

            vo.setManualEditor(tokenDetailVo.getManualEditor());
            vo.setId(tokenDetailVo.getId());
            updateTokenDetail(vo);
        }
        return Boolean.TRUE;
    }

    private void processValueDecimal(List<TokenDetailVo> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return;
        }
        for (TokenDetailVo vo : voList) {
            if (vo.getPrice() != null && vo.getPrice().scale() > 9) {
                vo.setPrice(vo.getPrice().setScale(9, RoundingMode.HALF_UP));
            }
            if (vo.getPrice24hChange() != null && vo.getPrice24hChange().scale() > 9) {
                vo.setPrice24hChange(vo.getPrice24hChange().setScale(9, RoundingMode.HALF_UP));
            }
            if (vo.getMktCap() != null && vo.getMktCap().scale() > 9) {
                vo.setMktCap(vo.getMktCap().setScale(9, RoundingMode.HALF_UP));
            }
            if (vo.getTotalSupply() != null && vo.getTotalSupply().scale() > 9) {
                vo.setTotalSupply(vo.getTotalSupply().setScale(9, RoundingMode.HALF_UP));
            }
            if (vo.getVolumePast24h() != null && vo.getVolumePast24h().scale() > 4) {
                vo.setVolumePast24h(vo.getVolumePast24h().setScale(4, RoundingMode.HALF_UP));
            }
            if (vo.getCirculatingSupply() != null && vo.getCirculatingSupply().scale() > 9) {
                vo.setCirculatingSupply(vo.getCirculatingSupply().setScale(9, RoundingMode.HALF_UP));
            }
        }
    }

    @Override
    public TokenDetailVo queryWithCache(String address) {
        String key = String.format(RedisCacheConstant.TOKEN_DETAIL_KEY, address);
        TokenDetailVo vo = redisUtil.get(key, TokenDetailVo.class);
        if (vo == null) {
            vo = dao.queryByAddress(address);
            if (vo != null) {
                redisUtil.set(key, vo, RedisCacheConstant.TOKEN_DETAIL_KEY_TIMEOUT);
            }
        }
        if (vo != null) {
            packagePrice(Lists.newArrayList(vo));
        }
        return vo;
    }

    @Override
    public Integer addTokenDetail(TokenDetailVo vo) {
        Integer id = null;
        RLock lock = null;
        try {
            lock = redisUtil.lock("addTokenDetail_" + vo.getAddress());
            boolean b = lock.tryLock(3, 2, TimeUnit.SECONDS);
            if (b) {
                TokenDetailVo tokenDetailVo = queryWithCache(vo.getAddress());
                if (tokenDetailVo == null) {
                    processValueDecimal(Lists.newArrayList(vo));
                    dao.addTokenDetail(vo);
                    id = vo.getId();
                } else {
                    id = tokenDetailVo.getId();
                }
            }
        } catch (Exception e) {
            log.error("addTokenDetail-lock ERROR:", e);
        } finally {
            if (lock != null && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
        return id;
    }

    @Override
    public void updateTokenDetail(TokenDetailVo vo) {
        processValueDecimal(Lists.newArrayList(vo));
        dao.updateTokenDetail(vo);
        String key = String.format(RedisCacheConstant.TOKEN_DETAIL_KEY, vo.getAddress());
        redisUtil.delete(key);
    }

    @Override
    public void sendMsg4UpdateTokenDetailLastShowDetailTime(String address) {
        if (!redisUtil.setIfAbsent("showDetailTime" + address, "1", 600, TimeUnit.SECONDS)) {
            return;
        }

    }

    @Override
    public TokenDetailVo queryCacheWithAsync(String address) {
        TokenDetailVo tokenDetailVo = queryWithCache(address);
        if (Objects.isNull(tokenDetailVo)) {
            tokenDetailVo = tokenSyncService.syncTokenByAddressNew(address);
            if (Objects.nonNull(tokenDetailVo)) {
                return tokenDetailVo;
            }

        }
        return tokenDetailVo;
    }

    @Override
    public void batchUpdateTokenByAddress(List<TokenDetailVo> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return;
        }
        processValueDecimal(voList);
        dao.batchUpdateTokenDetail(voList);
    }

    @Override
    public TokenDetailWithUserTokenVo tokenDetailWithUserTokenInfo(TokenDetailSo so) {

        TokenDetailVo vo = queryWithCache(so.getAddress());
        if (vo == null) {
            log.warn("[tokenDetailWithUserTokenInfo] tot fund token by address: {}", so);
            throw new BaseException(ErrorConstant.TOKEN_NOT_FUND, "token not fund");
        }

        BigInteger tgUserId = Objects.isNull(so.getTgUserId()) ? ContextHolder.getUserId() : so.getTgUserId();
        packagePrice(Lists.newArrayList(vo));
        TokenDetailWithUserTokenVo tokenVo = new TokenDetailWithUserTokenVo();
        BeanUtils.copyProperties(vo, tokenVo);
        // isWatch
        UserTokenWatchVo userTokenWatchVo =
            userTokenWatchService.queryInfoByTgUserIdAndAddress(tgUserId, so.getAddress());
        if (userTokenWatchVo != null) {
            tokenVo.setIsWatch(Boolean.TRUE);
        } else {
            tokenVo.setIsWatch(Boolean.FALSE);
        }
        // package user tokenInfo
        UserTokenVo userTokenVo = userTokenService.queryByAddressAndTgUserId(tgUserId, so.getAddress());
        if (userTokenVo != null) {
            tokenVo.setAmount(userTokenVo.getAmount());
            tokenVo.setFirstBoughtTime(
                userTokenVo.getCreatedTime() == null ? LocalDateTime.now() : userTokenVo.getCreatedTime());
        }
        sendSyncOhlcv(so.getAddress());
        return tokenVo;
    }

    @Override
    public PageInfo<TokenDetailWithSecurityVo> queryTokenWithPageNew(TokenDetailSo so) {

        BigInteger userId = so.getTgUserId();
        // package param
        if (HomeTokenTabTypeEnum.FAVORITES.getType() == so.getTabType()) {
            so.setTgUserId(userId);
        }
        if (HomeTokenTabTypeEnum.HOT.getType() == so.getTabType()) {
            List<TokenTrendingVo> tokenTrendingVo =
                tokenTrendingService.queryMaxLastTimestampWithCache(so.getNetwork());
            if (org.apache.commons.collections4.CollectionUtils.isEmpty(tokenTrendingVo)) {
                return PageInfo.EMPTY;
            }
            so.setList(tokenTrendingVo.stream().map(TokenTrendingVo::getLastTimestamp).collect(Collectors.toList()));
        }

        PageMethod.startPage(so.getPageNum(), so.getPageSize());
        List<TokenDetailWithSecurityVo> list = dao.queryListByTabType(so);
        PageInfo<TokenDetailWithSecurityVo> page = new PageInfo<>(list);

        if (org.apache.commons.collections4.CollectionUtils.isEmpty(list) || Objects.isNull(userId)) {
            return page;
        }
        List<String> collect = list.stream().map(TokenDetailVo::getAddress).collect(Collectors.toList());
        List<UserTokenWatchVo> userTokenWatchVos = userTokenWatchService.queryByAddressList(userId, collect);
        if (org.apache.commons.collections4.CollectionUtils.isEmpty(userTokenWatchVos)) {
            return page;
        }
        Map<String, UserTokenWatchVo> mapList = userTokenWatchVos.stream()
            .collect(Collectors.toMap(UserTokenWatchVo::getAddress, Function.identity(), (k1, k2) -> k2));
        for (TokenDetailWithSecurityVo tokenDetailWithSecurityVo : list) {
            if (Objects.nonNull(mapList.get(tokenDetailWithSecurityVo.getAddress()))
                || Objects.nonNull(mapList.get(tokenDetailWithSecurityVo.getAddress().toUpperCase()))
                || Objects.nonNull(mapList.get(tokenDetailWithSecurityVo.getAddress().toLowerCase()))) {
                tokenDetailWithSecurityVo.setWatch(Boolean.TRUE);
            }
        }

        return page;
    }

    @Override
    public List<TokenDetailVo> searchByAddressOrSymbol(TokenDetailSo so) {
        // search by symbol
        List<TokenDetailVo> list = new ArrayList<>();
        packagePrice(list);
        // normal address length 43 or 44

        if (CollectionUtils.isEmpty(list) && TokenAddressValidator.isValidBscAddress(so.getAddressOrSymbol())) {
            TokenDetailVo vo = tokenSyncService.syncTokenByAddressNew(so.getAddressOrSymbol());
            if (vo != null) {
                list = Lists.newArrayList(vo);
            }
        } else {
            if (CollectionUtils.isEmpty(list) && TokenAddressValidator.isValidSolanaAddress(so.getAddressOrSymbol())) {
                TokenDetailVo vo = tokenSyncService.syncTokenByAddressNew(so.getAddressOrSymbol());
                if (vo != null) {
                    list = Lists.newArrayList(vo);
                }
            }
        }

        return list;
    }

    private void sendSyncOhlcv(String address) {
        CompletableFuture.runAsync(() -> tokenProducer.sendTokenProcessData(KafkaCommonMsgVo.builder()
            .type(KafkaCommonMsgTypeEnum.SYNC_OHLCV_PRICE.getType()).processData(address).build()), executor);

    }
}
