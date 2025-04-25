package cn.z.zai.dao;

import cn.z.zai.dto.entity.UserAccountTransactionHistory;

import cn.z.zai.dto.vo.UserTokenTransactionHistoryGroup;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.util.List;

@Mapper
@Repository
public interface UserAccountTransactionHistoryDao {

    void addHistory(UserAccountTransactionHistory userAccountTransactionHistory);

    String getTransId(BigInteger tgUserId, String transId);

    List<String> lastTransId(BigInteger tgUserId);

    List<UserTokenTransactionHistoryGroup> getTransactionHistoryListGroup(BigInteger tgUserId, String network);

    void delInfoByUserId(BigInteger tgUserId);

    Long getBuySellNum(BigInteger tgUserId);

    UserAccountTransactionHistory getFirstBoughtRecord(BigInteger tgUserId, String tokenAddress);

}
