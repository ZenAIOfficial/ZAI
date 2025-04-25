package cn.z.zai.service;


import java.math.BigInteger;


public interface UserTokenSyncService {

    void syncUserAccount(BigInteger tgUserId);

    void syncUserTokenListNew(BigInteger tgUserId);

    void syncUserAccountTransactionHistoryList(BigInteger tgUserId);
}
