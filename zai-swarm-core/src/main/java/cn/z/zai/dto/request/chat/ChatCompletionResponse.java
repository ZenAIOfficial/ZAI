package cn.z.zai.dto.request.chat;

import java.util.List;
import lombok.Data;

/**
 * Object containing a response from the chat completions api.
 */
@Data
public class ChatCompletionResponse {

    /**
     * Unique id assigned to this chat completion.
     */
    String id;

    /**
     * The type of object returned, should be "chat.completion"
     */
    String object;

    /**
     * The creation time in epoch seconds.
     */
    long created;
    
    /**
     * The GPT-3.5 model used.
     */
    String model;

    /**
     * A list of all generated completions.
     */
    List<ChatCompletionChoice> choices;

    /**
     * The API usage for this request.
     */
    Usage usage;

}
