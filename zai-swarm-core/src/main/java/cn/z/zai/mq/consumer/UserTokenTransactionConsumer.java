package cn.z.zai.mq.consumer;

import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.service.UserService;
import cn.z.zai.service.UserTokenSyncService;
import cn.z.zai.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.math.BigInteger;
import java.util.List;
import java.util.Objects;


@Slf4j
@Component
public class UserTokenTransactionConsumer {

    @Autowired
    private UserService userService;

    @Autowired
    private UserTokenSyncService userTokenSyncService;

    @Autowired
    private RedisUtil redisUtil;

    @KafkaListener(id = "UserTokenTransactionConsumer", groupId = "${kafka.group.userTokenTransactionGroup}", topics = {"${kafka.topic.userTokenTransactionTopic}"}, concurrency = "2")
    public void userTokenTransactionProcess(List<ConsumerRecord<String, String>> records, Acknowledgment ack) {
        if (records == null) {
            log.error("userTokenTransactionConsumer records is null");
            ack.acknowledge();
            return;
        }
        for (ConsumerRecord<String, String> record : records) {
            String message = record.value();
            log.info("userTokenTransactionConsumer: {}", message);
            BigInteger userId = null;
            try {
                userId = BigInteger.valueOf(Long.parseLong(message));
                UserVo userVo = userService.getUserByTgUserId(userId);
                if (Objects.isNull(userVo)) {
                    assert ack != null;
                    ack.acknowledge();
                    return;
                }

                userTokenSyncService.syncUserAccountTransactionHistoryList(userId);
            } catch (Exception e) {
                log.error("userTokenTransactionConsumer error who={} , error message is {}", message, e.getMessage());
                log.error("userTokenTransactionConsumer error who={} ", message, e);
            } finally {
                String protectKey = String.format(RedisCacheConstant.USER_ACCOUNT_TRANSACTION_MSG_SEND_PROTECT, userId);

                redisUtil.delete(protectKey);
            }
        }
        ack.acknowledge();
    }
}
