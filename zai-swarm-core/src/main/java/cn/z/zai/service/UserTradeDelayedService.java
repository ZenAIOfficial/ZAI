package cn.z.zai.service;

import java.math.BigInteger;

public interface UserTradeDelayedService {

    void triggerHeartBeat(BigInteger tgUserId);

    void triggerDelayedUserToken(BigInteger tgUserId);

    void triggerDelayedUserTokenHistory(BigInteger tgUserId);

}
