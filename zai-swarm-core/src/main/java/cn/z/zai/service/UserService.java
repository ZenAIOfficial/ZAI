package cn.z.zai.service;

import cn.z.zai.dto.vo.AuthSo;
import cn.z.zai.dto.vo.UserVo;

import java.math.BigInteger;

public interface UserService {

    /**
     * @param authSo
     * @return
     */
    UserVo auth(AuthSo authSo);


    Boolean updateLamports(BigInteger tgUserId, Long lamports);

    UserVo getUserByTgUserId(BigInteger tgUserId);


    void sendMessageSyncAccountInfo(BigInteger tgUserId);


}
