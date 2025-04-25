package cn.z.zai.service.impl;

import cn.z.zai.service.UserTradeDelayedService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigInteger;

@Slf4j
@Service
public class UserTradeDelayedServiceImpl implements UserTradeDelayedService {

    @Override
    public void triggerHeartBeat(BigInteger tgUserId) {

    }

    @Override
    public void triggerDelayedUserToken(BigInteger tgUserId) {

    }

    @Override
    public void triggerDelayedUserTokenHistory(BigInteger tgUserId) {

    }
}
