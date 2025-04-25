package cn.z.zai.service;

import cn.z.zai.dto.vo.UserTokenWatchVo;

import java.math.BigInteger;
import java.util.List;

public interface UserTokenWatchService {

    UserTokenWatchVo queryInfoByTgUserIdAndAddress(BigInteger tgUserId,String address);

    List<UserTokenWatchVo> queryAllByTgUserId(BigInteger tgUserId);

    List<UserTokenWatchVo> queryByAddressList(BigInteger tgUserId, List<String> addressList);

    void addUserTokenWatch(UserTokenWatchVo vo);

    void removeByAddressAndTgUserId(UserTokenWatchVo vo);
}
