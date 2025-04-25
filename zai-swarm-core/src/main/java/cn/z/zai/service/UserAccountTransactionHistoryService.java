package cn.z.zai.service;


import cn.z.zai.dto.entity.UserAccountTransactionHistory;
import cn.z.zai.dto.vo.UserTokenTransactionHistoryGroup;
import cn.z.zai.dto.so.BasePageSo;
import com.github.pagehelper.PageInfo;

import java.math.BigInteger;

public interface UserAccountTransactionHistoryService {


    String transIdCache(BigInteger tgUserId);

    void addHistory(UserAccountTransactionHistory userAccountTransactionHistory);


    String getTransId(BigInteger tgUserId, String transId);

    PageInfo<UserTokenTransactionHistoryGroup> getTransactionHistoryPage(BasePageSo so);

    PageInfo<UserTokenTransactionHistoryGroup> getWebTransactionHistoryPage(BasePageSo so);

    Long getBuySellNum(BigInteger tgUserId);

    UserAccountTransactionHistory getFirstBoughtRecord(BigInteger tgUserId, String tokenAddress);
}
