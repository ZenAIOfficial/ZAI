package cn.z.zai.service.impl;

import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.TokenNetWorkEnum;
import cn.z.zai.common.enums.TransTypeEnum;
import cn.z.zai.dao.UserAccountTransactionHistoryDao;
import cn.z.zai.dto.entity.UserAccountTransactionHistory;
import cn.z.zai.dto.so.BasePageSo;
import cn.z.zai.dto.vo.TokenDetailVo;
import cn.z.zai.dto.vo.UserTokenTransactionHistoryGroup;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.mq.producer.UserTokenTransactionProducer;
import cn.z.zai.service.TokenDetailService;
import cn.z.zai.service.UserAccountTransactionHistoryService;
import cn.z.zai.service.UserHandleService;
import cn.z.zai.service.UserService;
import cn.z.zai.util.CommonUtils;
import cn.z.zai.util.ContextHolder;
import cn.z.zai.util.RedisUtil;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;


@Slf4j
@Service
public class UserAccountTransactionHistoryServiceImpl implements UserAccountTransactionHistoryService {

    @Autowired
    private UserAccountTransactionHistoryDao userAccountTransactionHistoryDao;

    @Autowired
    private UserTokenTransactionProducer userTokenTransactionProducer;

    @Autowired
    private UserHandleService userHandleService;

    @Autowired
    private TokenDetailService tokenDetailService;

    @Autowired
    private UserService userService;
    @Autowired
    private RedisUtil redisUtil;

    @Override
    public String transIdCache(BigInteger tgUserId) {

        String untilKey = String.format(RedisCacheConstant.SIGNATURES_FOR_ADDRESS, tgUserId);
        String s = redisUtil.get(untilKey, String.class);
        if (StringUtils.isNotEmpty(s)) {
            return s;
        }
        List<String> s1 = userAccountTransactionHistoryDao.lastTransId(tgUserId);

        if (CollectionUtils.isEmpty(s1)) {
            return null;
        }
        String tsId = s1.get(0);
        redisUtil.setExSeconds(untilKey, tsId, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_3);
        return tsId;
    }

    @Override
    public void addHistory(UserAccountTransactionHistory userAccountTransactionHistory) {
        userAccountTransactionHistoryDao.addHistory(userAccountTransactionHistory);
        redisUtil.delete(String.format(RedisCacheConstant.BUY_SELL_NUM, userAccountTransactionHistory.getTgUserId()));
    }

    @Override
    public String getTransId(BigInteger tgUserId, String transId) {
        return userAccountTransactionHistoryDao.getTransId(tgUserId, transId);
    }

    @Override
    public Long getBuySellNum(BigInteger tgUserId) {

        UserVo userInfo = userHandleService.getUserInfo(tgUserId);
        if (Objects.isNull(userInfo)) {
            return 0L;
        }

        String buySellNumKey = String.format(RedisCacheConstant.BUY_SELL_NUM, tgUserId);
        Long aLong = redisUtil.get(buySellNumKey, Long.class);
        if (Objects.nonNull(aLong)) {
            return aLong;
        }
        aLong = 0L;
        Long buySellNum = userAccountTransactionHistoryDao.getBuySellNum(tgUserId);
        if (Objects.nonNull(buySellNum)) {
            aLong = buySellNum;
        }
        redisUtil.setExSeconds(buySellNumKey, aLong, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_1);
        return aLong;
    }

    @Override
    public UserAccountTransactionHistory getFirstBoughtRecord(BigInteger tgUserId, String tokenAddress) {
        return userAccountTransactionHistoryDao.getFirstBoughtRecord(tgUserId, tokenAddress);
    }

    @Override
    public PageInfo<UserTokenTransactionHistoryGroup> getTransactionHistoryPage(BasePageSo so) {
        BigInteger userId = ContextHolder.getUserId();
        if (so.getPageNum() == 1) {

            userTokenTransactionProducer.sendUserTokenTransaction(userId);
        }

        PageHelper.startPage(so.getPageNum(), so.getPageSize());
        List<UserTokenTransactionHistoryGroup> transactionHistoryListGroup = userAccountTransactionHistoryDao
            .getTransactionHistoryListGroup(userId, TokenNetWorkEnum.SOLANA.getNetwork());

        for (UserTokenTransactionHistoryGroup userTokenTransactionHistoryGroup : transactionHistoryListGroup) {
            Integer type = userTokenTransactionHistoryGroup.getType();
            if (Objects.equals(TransTypeEnum.buy.getType(), type)
                && Objects.nonNull(userTokenTransactionHistoryGroup.getSendTokenValue())) {
                userTokenTransactionHistoryGroup.setValue(userTokenTransactionHistoryGroup.getSendTokenValue());
            }

            if (Objects.equals(TransTypeEnum.buy.getType(), type)
                || Objects.equals(TransTypeEnum.seed.getType(), type)) {
                userTokenTransactionHistoryGroup.setType(2);
            } else if (Objects.equals(TransTypeEnum.sell.getType(), type)
                || Objects.equals(TransTypeEnum.receive.getType(), type)) {
                userTokenTransactionHistoryGroup.setType(1);
            }

            if (StringUtils.equals(userTokenTransactionHistoryGroup.getTokenAddress(),
                userTokenTransactionHistoryGroup.getReceiveTokenAddress())) {
                userTokenTransactionHistoryGroup.setSymbol(userTokenTransactionHistoryGroup.getReceiveTokenSymbol());
            } else {
                userTokenTransactionHistoryGroup.setSymbol(userTokenTransactionHistoryGroup.getSendTokenSymbol());
            }


            if (Objects.nonNull(userTokenTransactionHistoryGroup.getValue())) {
                userTokenTransactionHistoryGroup
                    .setValue(userTokenTransactionHistoryGroup.getValue().setScale(6, RoundingMode.HALF_UP));
            }

        }

        PageInfo<UserTokenTransactionHistoryGroup> pageInfo = new PageInfo<>(transactionHistoryListGroup);
        return pageInfo;
    }

    @Override
    public PageInfo<UserTokenTransactionHistoryGroup> getWebTransactionHistoryPage(BasePageSo so) {

        BigInteger userId = ContextHolder.getUserId();
        if (so.getPageNum() == 1) {
            userService.sendMessageSyncAccountInfo(userId);

            userTokenTransactionProducer.sendUserTokenTransaction(userId);
        }

        PageHelper.startPage(so.getPageNum(), so.getPageSize());
        List<UserTokenTransactionHistoryGroup> transactionHistoryListGroup =
            userAccountTransactionHistoryDao.getTransactionHistoryListGroup(userId, so.getNetwork());

        for (UserTokenTransactionHistoryGroup userTokenTransactionHistoryGroup : transactionHistoryListGroup) {
            Integer type = userTokenTransactionHistoryGroup.getType();

            if (Objects.equals(TransTypeEnum.buy.getType(), type)) {

                userTokenTransactionHistoryGroup
                    .setEquivalentSymbol(userTokenTransactionHistoryGroup.getSendTokenSymbol());

                TokenDetailVo tokenDetailVo =
                    tokenDetailService.queryCacheWithAsync(userTokenTransactionHistoryGroup.getSendTokenAddress());
                if (StringUtils.equalsIgnoreCase(userTokenTransactionHistoryGroup.getNetwork(),
                    TokenNetWorkEnum.BSC.getNetwork())) {
                    userTokenTransactionHistoryGroup.setEquivalentSymValue(CommonUtils
                        .getTokens(userTokenTransactionHistoryGroup.getSendTokenAmount(), tokenDetailVo.getDecimals()));
                } else {
                    userTokenTransactionHistoryGroup
                        .setEquivalentSymValue(CommonUtils.getTokens(userTokenTransactionHistoryGroup
                            .getSendTokenAmount().subtract(userTokenTransactionHistoryGroup.getAppSolChange())
                            .subtract(userTokenTransactionHistoryGroup.getParentSolChange())
                            .subtract(userTokenTransactionHistoryGroup.getFree()), tokenDetailVo.getDecimals()));
                }

            } else if (Objects.equals(TransTypeEnum.sell.getType(), type)) {

                userTokenTransactionHistoryGroup
                    .setEquivalentSymbol(userTokenTransactionHistoryGroup.getReceiveTokenSymbol());

                TokenDetailVo tokenDetailVo =
                    tokenDetailService.queryCacheWithAsync(userTokenTransactionHistoryGroup.getReceiveTokenAddress());

                if (StringUtils.equalsIgnoreCase(userTokenTransactionHistoryGroup.getNetwork(),
                    TokenNetWorkEnum.BSC.getNetwork())) {
                    userTokenTransactionHistoryGroup.setEquivalentSymValue(CommonUtils.getTokens(
                        userTokenTransactionHistoryGroup.getReceiveTokenAmount(), tokenDetailVo.getDecimals()));
                } else {
                    userTokenTransactionHistoryGroup
                        .setEquivalentSymValue(CommonUtils.getTokens(userTokenTransactionHistoryGroup
                            .getReceiveTokenAmount().subtract(userTokenTransactionHistoryGroup.getAppSolChange())
                            .subtract(userTokenTransactionHistoryGroup.getParentSolChange())
                            .subtract(userTokenTransactionHistoryGroup.getFree()), tokenDetailVo.getDecimals()));
                }

            }

            if (StringUtils.equals(userTokenTransactionHistoryGroup.getTokenAddress(),
                userTokenTransactionHistoryGroup.getReceiveTokenAddress())) {
                userTokenTransactionHistoryGroup.setSymbol(userTokenTransactionHistoryGroup.getReceiveTokenSymbol());

                TokenDetailVo tokenDetailVo =
                    tokenDetailService.queryCacheWithAsync(userTokenTransactionHistoryGroup.getReceiveTokenAddress());

                userTokenTransactionHistoryGroup.setValue(CommonUtils
                    .getTokens(userTokenTransactionHistoryGroup.getReceiveTokenAmount(), tokenDetailVo.getDecimals()));
            } else {
                userTokenTransactionHistoryGroup.setSymbol(userTokenTransactionHistoryGroup.getSendTokenSymbol());
                TokenDetailVo tokenDetailVo =
                    tokenDetailService.queryCacheWithAsync(userTokenTransactionHistoryGroup.getSendTokenAddress());

                userTokenTransactionHistoryGroup.setValue(CommonUtils
                    .getTokens(userTokenTransactionHistoryGroup.getSendTokenAmount(), tokenDetailVo.getDecimals()));
            }


            if (Objects.nonNull(userTokenTransactionHistoryGroup.getValue())) {
                userTokenTransactionHistoryGroup
                    .setValue(userTokenTransactionHistoryGroup.getValue().setScale(6, RoundingMode.HALF_UP));
            }

        }

        PageInfo<UserTokenTransactionHistoryGroup> pageInfo = new PageInfo<>(transactionHistoryListGroup);
        return pageInfo;
    }
}
