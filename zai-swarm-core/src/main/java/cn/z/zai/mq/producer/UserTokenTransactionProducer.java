package cn.z.zai.mq.producer;


import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.config.mq.KafkaTopicProperties;
import cn.z.zai.dto.vo.kafka.KafkaSendMsgVo;
import cn.z.zai.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.util.concurrent.TimeUnit;


@Slf4j
@Component
public class UserTokenTransactionProducer {

    @Autowired
    private KafkaStandardProducer kafkaStandardProducer;

    @Autowired
    private KafkaTopicProperties kafkaTopicProperties;
    
    @Autowired
    private RedisUtil redisUtil;


    public void sendUserTokenTransaction(BigInteger tgUserId) {

        String protectKey = String.format(RedisCacheConstant.USER_ACCOUNT_TRANSACTION_MSG_SEND_PROTECT, tgUserId);

        if (!redisUtil.setIfAbsent(protectKey, "1", RedisCacheConstant.EXPIRE_TIME_OUT_MINUTE_5, TimeUnit.SECONDS)) {
            return;
        }

        KafkaSendMsgVo kafkaSendMsgVo = new KafkaSendMsgVo();
        kafkaSendMsgVo.setTopic(kafkaTopicProperties.getUserTokenTransactionTopic());
        kafkaSendMsgVo.setMessageData(tgUserId.toString());
        kafkaStandardProducer.sendMessage(kafkaSendMsgVo);
    }
}
