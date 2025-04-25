package cn.z.zai.service.impl;

import cn.z.zai.dao.UserTokenWatchDao;
import cn.z.zai.dto.vo.UserTokenWatchVo;
import cn.z.zai.service.UserTokenWatchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;


@Slf4j
@Service
public class UserTokenWatchServiceImpl implements UserTokenWatchService {
    @Autowired
    private UserTokenWatchDao dao;

    @Override
    public UserTokenWatchVo queryInfoByTgUserIdAndAddress(BigInteger tgUserId, String address) {
        return dao.queryInfoByTgUserIdAndAddress(tgUserId,address);
    }

    @Override
    public List<UserTokenWatchVo> queryAllByTgUserId(BigInteger tgUserId) {
        return dao.queryAllByTgUserId(tgUserId);
    }

    @Override
    public List<UserTokenWatchVo> queryByAddressList(BigInteger tgUserId, List<String> addressList) {
        return dao.queryByAddressList(tgUserId, addressList);
    }

    @Override
    public void addUserTokenWatch(UserTokenWatchVo vo) {
        dao.addUserTokenWatch(vo);
    }

    @Override
    public void removeByAddressAndTgUserId(UserTokenWatchVo vo) {
        dao.deletedByAddressAndTgUserId(vo);
    }
}
