package cn.z.zai.mq.producer;

import cn.z.zai.config.mq.KafkaTopicProperties;
import cn.z.zai.dto.vo.kafka.KafkaCommonMsgVo;
import cn.z.zai.dto.vo.kafka.KafkaSendMsgVo;
import cn.z.zai.util.JsonUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TokenProducer {

    @Autowired
    private KafkaStandardProducer kafkaStandardProducer;
    @Autowired
    private KafkaTopicProperties kafkaTopicProperties;
    @Autowired
    private JsonUtil jsonUtil;

    public void sendTokenProcessData(KafkaCommonMsgVo kafkaCommonMsgVo) {
        KafkaSendMsgVo kafkaSendMsgVo = new KafkaSendMsgVo();
        kafkaSendMsgVo.setTopic(kafkaTopicProperties.getTokenTopic());
        kafkaSendMsgVo.setMessageData(jsonUtil.obj2String(kafkaCommonMsgVo));
        kafkaStandardProducer.sendMessage(kafkaSendMsgVo);
    }

    public void sendTokenPriceProcessData(KafkaCommonMsgVo kafkaCommonMsgVo) {
        KafkaSendMsgVo kafkaSendMsgVo = new KafkaSendMsgVo();
        kafkaSendMsgVo.setTopic(kafkaTopicProperties.getTokenPriceTopic());
        kafkaSendMsgVo.setMessageData(jsonUtil.obj2String(kafkaCommonMsgVo));
        kafkaStandardProducer.sendMessage(kafkaSendMsgVo);
    }
}
