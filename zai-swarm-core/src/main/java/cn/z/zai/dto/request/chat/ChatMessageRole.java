package cn.z.zai.dto.request.chat;

/**
 * see {@link ChatMessage} documentation.
 */
public enum ChatMessageRole {
    SYSTEM("system"),
    USER("user"),
    ASSISTANT("assistant");

    private final String value;

    ChatMessageRole(final String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }
}
