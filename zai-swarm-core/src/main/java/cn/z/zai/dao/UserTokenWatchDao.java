package cn.z.zai.dao;

import cn.z.zai.dto.vo.UserTokenWatchVo;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.math.BigInteger;
import java.util.List;

@Mapper
@Repository
public interface UserTokenWatchDao {

    UserTokenWatchVo queryInfoByTgUserIdAndAddress(BigInteger tgUserId, String address);

    List<UserTokenWatchVo> queryAllByTgUserId(BigInteger tgUserId);

    List<UserTokenWatchVo> queryByAddressList(BigInteger tgUserId, List<String> addressList);

    void addUserTokenWatch(UserTokenWatchVo vo);

    void deletedByAddressAndTgUserId(UserTokenWatchVo vo);


    void delInfoByUserId(BigInteger tgUserId);
}
