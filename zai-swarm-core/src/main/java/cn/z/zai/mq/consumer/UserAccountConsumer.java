package cn.z.zai.mq.consumer;

import cn.z.zai.common.enums.UserSourceType;
import cn.z.zai.dto.vo.UserVo;
import cn.z.zai.service.UserService;
import cn.z.zai.service.UserTokenSyncService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
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
public class UserAccountConsumer {

    @Autowired
    private UserService userService;

    @Autowired
    private UserTokenSyncService userTokenSyncService;

    @KafkaListener(id = "UserAccountConsumer", groupId = "${kafka.group.userAccountGroup}", topics = {"${kafka.topic.userAccountTopic}"}, concurrency = "1")
    public void userAccountProcess(List<ConsumerRecord<String, String>> records, Acknowledgment ack) {
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
                if (Objects.isNull(userVo) || userVo.getSource() == UserSourceType.TELEGRAM.getCode().intValue()) {
                    assert ack != null;
                    ack.acknowledge();
                    return;
                }
                if (StringUtils.isEmpty(userVo.getAddress())) {
                    log.warn("UserAccountConsumer address is empty not need process");
                    return;
                }
                userTokenSyncService.syncUserAccount(userId);
                ack.acknowledge();
            } catch (Exception e) {
                log.error("logProcess error who={} , error message is {}", message, e.getMessage());
                log.error("logProcess error who={} ", message, e);
            }
        }
    }
}
