package cn.z.zai.mq.consumer;

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
public class UserTokenConsumer {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private UserTokenSyncService userTokenSyncService;

    @KafkaListener(id = "UserTokenConsumer", groupId = "${kafka.group.userTokenGroup}", topics = {"${kafka.topic.userTokenTopic}"}, concurrency = "1")
    public void userTokenProcess(List<ConsumerRecord<String, String>> records, Acknowledgment ack) {
        if (records == null) {
            log.error("UserTokenConsumer records is null");
            ack.acknowledge();
            return;
        }
        for (ConsumerRecord<String, String> record : records) {
            String message = record.value();
            log.info("UserTokenConsumer: {}", message);
            try {
                BigInteger userId = BigInteger.valueOf(Long.parseLong(message));
                UserVo userVo = userService.getUserByTgUserId(userId);
                if (Objects.isNull(userVo)) {
                    assert ack != null;
                    ack.acknowledge();
                    return;
                }
                userTokenSyncService.syncUserTokenListNew(userId);
                ack.acknowledge();
            } catch (Exception e) {
                log.error("UserTokenConsumer error who={} , error message is {}", message, e.getMessage());
                log.error("UserTokenConsumer error who={} ", message, e);
            }
        }
    }
}
