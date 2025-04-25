package cn.z.zai.service.impl;

import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.dto.entity.SlippageVo;
import cn.z.zai.service.SlippageService;
import cn.z.zai.util.ContextHolder;
import cn.z.zai.util.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.time.LocalDate;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Service
public class SlippageServiceImpl implements SlippageService {
    @Autowired
    private RedisUtil redisUtil;

    @Override
    public SlippageVo userSlippage(BigInteger tgUserId) {
        if (Objects.isNull(tgUserId)) {
            return new SlippageVo();
        }

        String cacheKey = String.format(RedisCacheConstant.SLIPPAGE_INFO, tgUserId);

        SlippageVo slippageVoCache = redisUtil.get(cacheKey, SlippageVo.class);
        if (Objects.isNull(slippageVoCache)) {
            return new SlippageVo();
        }

        keepAliveSlippage(tgUserId);
        return slippageVoCache;
    }

    @Override
    public Integer buySlippage(BigInteger tgUserId) {
        SlippageVo slippageVo = userSlippage(tgUserId);
        if (Objects.isNull(slippageVo) || Objects.isNull(slippageVo.getBuySlippageBps())) {
            return new SlippageVo().getBuySlippageBps();
        }
        return slippageVo.getBuySlippageBps();
    }

    @Override
    public Integer sellSlippage(BigInteger tgUserId) {
        SlippageVo slippageVo = userSlippage(tgUserId);
        if (Objects.isNull(slippageVo) || Objects.isNull(slippageVo.getSellSlippageBps())) {
            return new SlippageVo().getSellSlippageBps();
        }
        return slippageVo.getSellSlippageBps();
    }

    @Override
    public void updateSlippage(SlippageVo slippageVo) {

        String cacheKey = String.format(RedisCacheConstant.SLIPPAGE_INFO, ContextHolder.getUserId());
        SlippageVo slippageVoCache = redisUtil.get(cacheKey, SlippageVo.class);
        if (Objects.isNull(slippageVoCache)) {
            slippageVoCache = new SlippageVo();
        }

        if (Objects.nonNull(slippageVo.getBuySlippageBps())) {
            slippageVoCache.setBuySlippageBps(slippageVo.getBuySlippageBps());
        }
        if (Objects.nonNull(slippageVo.getSellSlippageBps())) {
            slippageVoCache.setSellSlippageBps(slippageVo.getSellSlippageBps());
        }
        redisUtil.setExSeconds(cacheKey, slippageVoCache, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_7 * 2);
    }

    public void keepAliveSlippage(BigInteger tgUserId) {
        if (!redisUtil.setIfAbsent("keepAliveSlippage:" + LocalDate.now() + tgUserId, "1",
            RedisCacheConstant.EXPIRE_TIME_OUT_DAY_1, TimeUnit.SECONDS)) {
            return;
        }

        String cacheKey = String.format(RedisCacheConstant.SLIPPAGE_INFO, tgUserId);
        SlippageVo slippageVoCache = redisUtil.get(cacheKey, SlippageVo.class);
        if (Objects.isNull(slippageVoCache)) {
            return;
        }
        redisUtil.expire(cacheKey, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_7 * 2, TimeUnit.SECONDS);
    }
}
