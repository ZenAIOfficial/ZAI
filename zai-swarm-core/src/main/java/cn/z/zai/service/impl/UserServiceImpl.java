package cn.z.zai.service.impl;

import cn.z.zai.common.constant.ErrorConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.constant.ResponseCodeConstant;
import cn.z.zai.common.constant.UserRedisConstant;
import cn.z.zai.common.enums.UserSourceType;
import cn.z.zai.dto.entity.User;
import cn.z.zai.dto.vo.AuthSo;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.exception.BaseException;
import cn.z.zai.exception.ServiceException;
import cn.z.zai.mq.producer.UserAccountProducer;
import cn.z.zai.mq.producer.UserTokenProducer;
import cn.z.zai.service.UserHandleService;
import cn.z.zai.service.UserService;
import cn.z.zai.util.InnerUUidUtils;
import cn.z.zai.util.JsonUtil;
import cn.z.zai.util.JwtUtils;
import cn.z.zai.util.RedisUtil;
import cn.z.zai.util.RegularUtils;
import cn.z.zai.util.ZAIUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserHandleService userHandleService;


    @Autowired
    private JsonUtil jsonUtil;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private UserTokenProducer userTokenProducer;

    @Autowired
    private UserAccountProducer userAccountProducer;


    @Override
    public UserVo auth(AuthSo authSo) {
        // validate
        UserVo authUserVo = buildByWeb(authSo);

        if (RegularUtils.includingChinese(authUserVo.getFirstName() + authUserVo.getLastName())) {
            log.info("user reject because chinese name : {}", jsonUtil.obj2String(authUserVo));
            throw new BaseException(ErrorConstant.NOT_AVAILABLE, "This service is not available in your region.");
        }

        User clicker = new User();
        BeanUtils.copyProperties(authUserVo, clicker);
        clicker.setIsActive(Boolean.TRUE);

        // process
        userHandleService.initUser(clicker);

        UserVo userVo = getUserByTgUserId(authUserVo.getTgUserId());
        userVo.setVerifyCode(null);

        // auth
        String userIdWithTime = authUserVo.getTgUserId() + "_" + authUserVo.getTgUserId();
        String token = jwtUtils.generateToken(userIdWithTime);
        userVo.setToken(token);
        redisUtil.setEx(String.format(RedisCacheConstant.AUTH_TOKEN_KEY, userIdWithTime), token, 60 * 60 * 24 * 7L, TimeUnit.SECONDS);

        //update account
        this.sendMessageSyncAccountInfo(authUserVo.getTgUserId());
        userVo.setTgUserIdStr(userVo.getTgUserId().toString());
        return userVo;
    }


    @Override
    public Boolean updateLamports(BigInteger tgUserId, Long lamports) {
        if (Objects.isNull(lamports)) {
            return false;
        }
        UserVo userVo = getUserByTgUserId(tgUserId);
        if (Objects.isNull(userVo) || Objects.isNull(userVo.getLamports())) {
            return false;
        }

        if (userVo.getLamports().compareTo(lamports) != 0) {
            User temp = new User();
            temp.setTgUserId(tgUserId);
            temp.setLamports(lamports);
            updateUser(temp);
            return true;
        }
        return false;
    }

    @Override
    public UserVo getUserByTgUserId(BigInteger tgUserId) {

        UserVo userInfo = userHandleService.getUserInfo(tgUserId);
        return userInfo;
    }


    @Override
    public void sendMessageSyncAccountInfo(BigInteger tgUserId) {
        // update Token
        userTokenProducer.sendUserToken(tgUserId);
        // update Sol
        userAccountProducer.sendUserAccount(tgUserId);
    }


    private UserVo updateUser(User userInfo) {
        if (Objects.isNull(userInfo.getTgUserId())) {
            return null;
        }
        userHandleService.updateUserInfo(userInfo.getTgUserId(), userInfo);
        UserVo userVo = getUserByTgUserId(userInfo.getTgUserId());
        userVo.setVerifyCode(null);
        return userVo;
    }


    private BigInteger buildTgUserId() {
        InnerUUidUtils uidUtils = new InnerUUidUtils();
        long mockTgUserId = uidUtils.nextId();
        return BigInteger.valueOf(mockTgUserId);
    }

    private UserVo buildByWeb(AuthSo authSo) {
        if (StringUtils.isEmpty(authSo.getAddress())) {
            log.error("User Auth From WEB_BOT ERROR ,address is null; authSo={}", jsonUtil.obj2String(authSo));
            throw new ServiceException(ResponseCodeConstant.ERROR_GLOBAL_UN_AUTH);
        }
        //verify
        String key = String.format(RedisCacheConstant.WEB_BOT_AUTH_ADDRESS, authSo.getAddress());
        String uId = redisUtil.get(key);
        if (StringUtils.isEmpty(uId)) {
            log.error("User Auth From WEB_BOT ERROR ,uId is null; authSo={}", jsonUtil.obj2String(authSo));
            throw new ServiceException(ResponseCodeConstant.ERROR_GLOBAL_UN_AUTH);
        }
        redisUtil.delete(key);
        Boolean verify = ZAIUtil.verifySignature(authSo.getSignature(), authSo.getAddress(), uId);
        if (!verify) {
            log.error("User Auth From WEB_BOT ERROR ,verify is false; authSo={}", jsonUtil.obj2String(authSo));
            throw new ServiceException(ResponseCodeConstant.ERROR_GLOBAL_UN_AUTH);
        }

        BigInteger bigInteger = redisUtil.get(String.format(UserRedisConstant.USER_WEB_ADDRESS, authSo.getAddress()), BigInteger.class);
        if (Objects.isNull(bigInteger) || bigInteger.compareTo(BigInteger.ZERO) == 0) {
            bigInteger = buildTgUserId();
        }
        UserVo authUserVo = new UserVo();
        authUserVo.setSource(UserSourceType.WEB_BOT.getCode());
        authUserVo.setAddress(authSo.getAddress());
        authUserVo.setTgUserId(bigInteger);
        authUserVo.setFirstName("WEB");
        authUserVo.setLastName("WEB");
        authUserVo.setUserName("WEB");
        authUserVo.setLanguageCode("WEB");
        return authUserVo;
    }


}
