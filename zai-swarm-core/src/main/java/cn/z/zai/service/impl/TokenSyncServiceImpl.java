package cn.z.zai.service.impl;

import cn.z.zai.common.constant.BscAddressConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.constant.TokenAddressConstant;
import cn.z.zai.common.enums.SolanaProgramIdEnum;
import cn.z.zai.dto.request.BirdEyeCreationTokenInfoRequest;
import cn.z.zai.dto.request.BirdEyePriceRequest;
import cn.z.zai.dto.request.BirdEyeTokenOverviewRequest;
import cn.z.zai.dto.response.BirdEyeCreationTokenInfoResponse;
import cn.z.zai.dto.response.BirdEyePriceResponse;
import cn.z.zai.dto.response.BirdEyeTokenOverviewResponse;
import cn.z.zai.dto.response.QuickNodeResponseTokenAccountsByOwnerItem;
import cn.z.zai.dto.response.QuickNodeResponseTokenAccountsByOwnerItemValue;
import cn.z.zai.dto.response.QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.service.TokenDetailService;
import cn.z.zai.service.TokenSearchService;
import cn.z.zai.service.TokenSyncService;
import cn.z.zai.util.RedisUtil;
import cn.z.zai.util.TimeUtil;
import cn.z.zai.util.TokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.compress.utils.Lists;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;


@Slf4j
@Service
public class TokenSyncServiceImpl implements TokenSyncService {

    @Autowired
    private RedisUtil redisUtil;


    @Autowired
    private BirdEyeApi birdEyeApi;
    @Autowired
    @Lazy
    private TokenSyncService self;
    @Autowired
    @Lazy
    private TokenDetailService tokenDetailService;

    @Autowired
    private TokenSearchService tokenSearchService;

    @Autowired
    private QuickNodeApi quickNodeApi;

    @Autowired
    @Qualifier("asyncTokenBaseExecutor")
    private Executor executor;


    @Override
    public TokenDetailVo syncTokenByAddressNew(String address) {
        TokenDetailVo vo = new TokenDetailVo();
        vo.setAddress(address);
        //market info
        BirdEyeTokenOverviewResponse overviewResponse = self.syncBirdEyeTokenOverviewWithCache(address);
        if (overviewResponse == null) {
            return null;
        }
        TokenUtils.packageTokenDetailVoByOverview(vo, overviewResponse);
        //deploy time
        BirdEyeCreationTokenInfoResponse deployTimeResponse = self.syncTokenDeployTime(address);
        if (deployTimeResponse != null && deployTimeResponse.getBlockUnixTime() != null) {
            vo.setDeployTime(BigInteger.valueOf(deployTimeResponse.getBlockUnixTime()));
        }
        cacheTokenPriceAnd24HChange(vo.getAddress(), vo.getPrice(), vo.getPrice24hChange());
        tokenDetailService.saveTokenDetail(vo);
        return vo;
    }


    @Override
    public BirdEyeCreationTokenInfoResponse syncTokenDeployTime(String address) {
        if (StringUtils.isEmpty(address)) {
            return null;
        }
        BirdEyeCreationTokenInfoRequest build = BirdEyeCreationTokenInfoRequest.builder().address(address).build();
        build.setNetwork(tokenSearchService.tokenNetwork(address));
        return birdEyeApi.creationTokenInfo(build);
    }


    @Override
    public BirdEyeTokenOverviewResponse syncBirdEyeTokenOverviewWithCache(String address) {
        String key = String.format(RedisCacheConstant.BIRD_EYE_TOKEN_OVERVIEW_KEY, address);
        BirdEyeTokenOverviewResponse cache = redisUtil.get(key, BirdEyeTokenOverviewResponse.class);
        if (cache == null) {
            BirdEyeTokenOverviewRequest build = BirdEyeTokenOverviewRequest.builder().address(address).build();
            build.setNetwork(tokenSearchService.tokenNetwork(address));
            cache = birdEyeApi.tokenOverview(build);
            if (cache != null) {
                redisUtil.set(key, cache, RedisCacheConstant.BIRD_EYE_TOKEN_OVERVIEW_KEY_TIMEOUT);
                cacheTokenPriceAnd24HChange(cache.getAddress(), cache.getPrice(), cache.getPriceChange24hPercent());
            }
        }
        return cache;
    }


    @Override
    public List<QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo> syncAccountTokens(String walletAddress) {
        List<QuickNodeResponseTokenAccountsByOwnerItemValueAccountDataParsedInfo> resultList = Lists.newArrayList();
        // query splToken and splToken2022
        QuickNodeResponseTokenAccountsByOwnerItem tokenAccountsByOwner = quickNodeApi.getTokenAccountsByOwner(walletAddress, SolanaProgramIdEnum.SPL_TOKEN.getProgramId());
        QuickNodeResponseTokenAccountsByOwnerItem tokenAccountsByOwner2022 = quickNodeApi.getTokenAccountsByOwner(walletAddress, SolanaProgramIdEnum.SPL_TOKEN_2022.getProgramId());
        // merge
        List<QuickNodeResponseTokenAccountsByOwnerItemValue> list = Lists.newArrayList();
        if (tokenAccountsByOwner != null && !CollectionUtils.isEmpty(tokenAccountsByOwner.getValue())) {
            list.addAll(tokenAccountsByOwner.getValue());
        }
        if (tokenAccountsByOwner2022 != null && !CollectionUtils.isEmpty(tokenAccountsByOwner2022.getValue())) {
            list.addAll(tokenAccountsByOwner2022.getValue());
        }
        for (QuickNodeResponseTokenAccountsByOwnerItemValue item : list) {
            if (item.getAccount() != null && item.getAccount().getData() != null && item.getAccount().getData().getParsed() != null
                    && item.getAccount().getData().getParsed().getInfo() != null) {
                resultList.add(item.getAccount().getData().getParsed().getInfo());
            }
        }
        if (CollectionUtils.isEmpty(resultList)) {
            log.info("[syncAccountTokens] quickNode response is null :{}", walletAddress);
        }
        return resultList;
    }

    @Override
    public BirdEyePriceResponse asyncBirdEyePriceRealTime(String address) {
        BirdEyePriceResponse cacheResponse = getBirdEyePriceAi(address, RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_2);

        if (Objects.nonNull(cacheResponse) && TimeUtil.currentEpochSecond()
                - cacheResponse.getUpdateUnixTime() <= RedisCacheConstant.EXPIRE_TIME_OUT_SECOND_5) {
            BigDecimal finalPrice = cacheResponse.getValue();
            BigDecimal finalPriceChange24h = cacheResponse.getPriceChange24h();
            CompletableFuture.runAsync(() -> {

                cacheTokenPriceAnd24HChange(address, finalPrice, finalPriceChange24h);
                TokenDetailVo vo = new TokenDetailVo();
                vo.setAddress(address);
                vo.setPrice(finalPrice);
                vo.setPrice24hChange(finalPriceChange24h);
                tokenDetailService.batchUpdateTokenByAddress(com.google.common.collect.Lists.newArrayList(vo));
            }, executor);
        }
        return cacheResponse;
    }

    private void cacheTokenPriceAnd24HChange(String address, BigDecimal price, BigDecimal price24HChange) {
        cacheTokenPrice(address, price);
        cacheTokenPrice24HChange(address, price24HChange);
    }

    private void cacheTokenPrice(String address, BigDecimal price) {
        if (StringUtils.isNotEmpty(address) && price != null && price.compareTo(BigDecimal.ZERO) > 0) {
            String cacheKey = String.format(RedisCacheConstant.BIRD_EYE_PRICE_MULTIPLE_KEY, address);
            redisUtil.set(cacheKey, price, RedisCacheConstant.BIRD_EYE_PRICE_MULTIPLE_KEY_TIMEOUT);
        }
    }

    private void cacheTokenPrice24HChange(String address, BigDecimal price24HChange) {
        if (StringUtils.isNotEmpty(address) && price24HChange != null) {
            String cacheKey = String.format(RedisCacheConstant.BIRD_EYE_PRICE_24H_CHANGE_MULTIPLE_KEY, address);
            redisUtil.set(cacheKey, price24HChange, RedisCacheConstant.BIRD_EYE_PRICE_24H_CHANGE_MULTIPLE_KEY_TIMEOUT);
        }
    }

    private BirdEyePriceResponse getBirdEyePriceAi(String address, Long updateTime) {
        String key = String.format(RedisCacheConstant.BIRD_EYE_PRICE_DATA_KEY, address);
        BirdEyePriceResponse cacheResponse = redisUtil.get(key, BirdEyePriceResponse.class);
        if (Objects.isNull(cacheResponse) || TimeUtil.currentEpochSecond()
                - cacheResponse.getUpdateUnixTime() > updateTime) {
            BirdEyePriceRequest build = BirdEyePriceRequest.builder().address(address).build();
            if (StringUtils.equals(TokenAddressConstant.SOL_ADDRESS, address)) {
                build.setAddress(TokenAddressConstant.WSOL_ADDRESS);
            }
            if (StringUtils.equals(BscAddressConstant.BNB_ADDRESS, address)) {
                build.setAddress(BscAddressConstant.WBNB_ADDRESS);
            }
            build.setNetwork(tokenSearchService.tokenNetwork(address));
            cacheResponse = birdEyeApi.price(build);
            if (Objects.isNull(cacheResponse) || Objects.isNull(cacheResponse.getValue())) {
                return cacheResponse;
            }
            BigDecimal price = cacheResponse.getValue();
            if (price.scale() > 9) {
                cacheResponse.setValue(price.setScale(9, RoundingMode.HALF_UP));
            }
            BigDecimal priceChange24h = cacheResponse.getPriceChange24h();
            if (priceChange24h != null && priceChange24h.scale() > 9) {
                cacheResponse.setPriceChange24h(priceChange24h.setScale(9, RoundingMode.HALF_UP));
            }
            redisUtil.setExSeconds(key, cacheResponse, RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_3);
        }
        return cacheResponse;
    }


}
