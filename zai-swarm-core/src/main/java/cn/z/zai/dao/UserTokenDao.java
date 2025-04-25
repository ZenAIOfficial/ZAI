package cn.z.zai.dao;

import cn.z.zai.dto.entity.UserToken;
import cn.z.zai.dto.vo.UserTokenVo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.util.List;

@Mapper
@Repository
public interface UserTokenDao {

    UserTokenVo queryByAddressAndTgUserId(BigInteger tgUserId, String address, String network);
    List<UserTokenVo> getTokenList(BigInteger tgUserId, String network);


    void deleteTokenList(BigInteger tgUserId, String network);

    void insertTokenList(List<UserToken> tokenList);

    void deleteTokenDetail(BigInteger tgUserId, String address, String network);

    void batchUpdate(List<UserToken> updateList);

}
