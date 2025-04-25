package cn.z.zai.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.TokenNetWorkEnum;
import cn.z.zai.dao.TokenTrendingDao;
import cn.z.zai.dto.so.TokenTrendingSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.TokenTrendingVo;
import cn.z.zai.service.TokenSyncService;
import cn.z.zai.service.TokenTrendingService;
import cn.z.zai.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TokenTrendingServiceImpl implements TokenTrendingService {
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private TokenTrendingDao dao;

    @Autowired
    private TokenSyncService tokenSyncService;

    @Override
    public List<TokenTrendingVo> queryMaxLastTimestampWithCache(String network) {
        if (StringUtils.isNotEmpty(network)) {
            return Collections.singletonList(getTokenTrendingVo(network));
        }
        TokenTrendingVo tokenTrendingVoSolana = getTokenTrendingVo(TokenNetWorkEnum.SOLANA.getNetwork());

        TokenTrendingVo tokenTrendingVoBsc = getTokenTrendingVo(TokenNetWorkEnum.BSC.getNetwork());

        List<TokenTrendingVo> rsp = new ArrayList<>();

        if (Objects.nonNull(tokenTrendingVoSolana)) {
            rsp.add(tokenTrendingVoSolana);
        }
        if (Objects.nonNull(tokenTrendingVoBsc)) {
            rsp.add(tokenTrendingVoBsc);
        }
        return rsp;
    }

    @Nullable
    private TokenTrendingVo getTokenTrendingVo(String network) {
        String key = String.format(RedisCacheConstant.TOKEN_TRENDING_NETWORK_LAST_TIME_KEY, network);
        BigInteger time = redisUtil.get(key, BigInteger.class);
        if (time != null) {
            TokenTrendingVo vo = new TokenTrendingVo();
            vo.setLastTimestamp(time);
            return vo;
        }
        TokenTrendingVo vo = dao.queryMaxLastTimestamp(network);
        if (vo != null) {
            redisUtil.set(key, vo.getLastTimestamp(), RedisCacheConstant.TOKEN_TRENDING_LAST_TIME_KEY_TIMEOUT);
        }
        return vo;
    }

    @Override
    public List<TokenDetailVo> queryTrending(TokenTrendingSo so) {
        return dao.queryTrending(so);
    }

    @Override
    public void addBatch(List<TokenTrendingVo> voList) {

        if (CollUtil.isEmpty(voList)) {
            return;
        }
        Map<String, List<TokenTrendingVo>> collect =
            voList.stream().collect(Collectors.groupingBy(TokenTrendingVo::getNetwork));

        collect.forEach((k, v) -> {
            if (CollUtil.isNotEmpty(v)) {
                String key = String.format(RedisCacheConstant.TOKEN_TRENDING_NETWORK_LAST_TIME_KEY, k);
                BigInteger time = redisUtil.get(key, BigInteger.class);
                if (time == null || time.compareTo(v.get(0).getLastTimestamp()) < 0) {
                    redisUtil.set(key, v.get(0).getLastTimestamp(),
                        RedisCacheConstant.TOKEN_TRENDING_LAST_TIME_KEY_TIMEOUT);
                }
            }
        });

        List<TokenTrendingVo> values = new ArrayList<>(voList.stream()
            .collect(
                Collectors.toMap(TokenTrendingVo::getAddress, Function.identity(), (k1, k2) -> k1, LinkedHashMap::new))
            .values());
        dao.addBatch(values);
    }

    @Override
    public List<TokenDetailVo> queryTrendingRandom(TokenTrendingSo so) {
        return dao.queryTrendingRandom(so);
    }
}
