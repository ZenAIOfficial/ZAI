package cn.z.zai.service;

import cn.z.zai.dto.entity.ZAiLineDetail;
import cn.z.zai.dto.request.chat.ChatMessage;
import cn.z.zai.dto.request.chat.ZAIBaseChatContent;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.List;


public interface AiBusinessService {

    List<ChatMessage> buildChatMessage(String messageId);

    void asyncSaveChatDetail(String messageId, ZAiLineDetail zAiLineDetail, String oneQuestId);

    List<ZAIBaseChatContent> coreBusiness(String json, String connId, BigInteger tgUserId, String oneQuestId);

    Boolean sessionLimitedPre(BigInteger tgUserid);

    Boolean sessionLimitedCheck(BigInteger tgUserid);

    BigDecimal priceTokens(String tokenAddress);
}
