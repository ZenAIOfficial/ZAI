package cn.z.zai.controller;

import cn.z.zai.common.constant.ErrorConstant;
import cn.z.zai.config.encrypt.annotation.UnSignAndEncrypt;
import cn.z.zai.dto.Response;
import cn.z.zai.dto.entity.ZAiLine;
import cn.z.zai.dto.request.chat.ZAIChatRequest;
import cn.z.zai.dto.vo.ChatReq;
import cn.z.zai.service.AiBusinessService;
import cn.z.zai.service.OpenChatGPTService;
import cn.z.zai.service.ZAiLineDetailService;
import cn.z.zai.service.ZAiLineService;
import cn.z.zai.util.BaseSseEmitterServerUtil;
import cn.z.zai.util.ContextHolder;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.validation.Valid;
import java.util.List;



@RestController
@RequestMapping("/ai")
public class AIController {
    @Autowired
    private OpenChatGPTService openChatGPTService;
    @Autowired
    private ZAiLineService zAiLineService;
    @Autowired
    private ZAiLineDetailService zAiLineDetailService;
    @Autowired
    private AiBusinessService aiBusinessService;

    @UnSignAndEncrypt
    @PostMapping(path = "/chat",produces = {MediaType.TEXT_EVENT_STREAM_VALUE})
    public SseEmitter streamChatPost(@RequestBody ZAIChatRequest request) {
        //3min
        request.setTgUserId(ContextHolder.getUserId());
        String messageId = request.getMessageId();
        SseEmitter conn = BaseSseEmitterServerUtil.conn(messageId, 3 * 60 * 1000L);
        openChatGPTService.asyncStreamChat(request,messageId);
        return conn;
    }



    @GetMapping(path = "/chatPre")
    public Response<?> chatPre() {

        if (BooleanUtils.isTrue(aiBusinessService.sessionLimitedPre(ContextHolder.getUserId()))) {
            return Response.fail(ErrorConstant.SESSION_LIMIT,
                "You’ve reached the maximum chat limit for today, please come back tomorrow!");
        }
        return Response.success();
    }

    @GetMapping(path = "/chatLimited")
    public Response<?> chatLimited() {
        return Response.success(aiBusinessService.sessionLimitedPre(ContextHolder.getUserId()));
    }

    @GetMapping("/chat/list")
    public Response<List<ZAiLine>> chatList(){
        List<ZAiLine> list = zAiLineService.queryByTgUserId(ContextHolder.getUserId());
        return Response.success(list);
    }

    @GetMapping("/chat/log")
    public Response chatLogList(@RequestParam("messageId")String messageId){
        return Response.success(zAiLineDetailService.queryByMessageId(messageId));
    }

    @PostMapping("/chat/del")
    public Response<?> delChatList(@RequestBody @Valid ChatReq chatReq) {
        zAiLineService.delBuyMessageId(chatReq.getMessageId());
        return Response.success();
    }

}
