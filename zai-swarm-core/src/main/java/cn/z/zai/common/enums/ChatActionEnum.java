package cn.z.zai.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public enum ChatActionEnum {

    TEXT("text"),

    TOKEN_DETAIL("tokenDetail"),

    TOKEN_DETAIL_HTML("tokenDetailHtml"),

    TOKEN_INFO("tokenInfo"),

    BALANCE_CHECK("balanceCheck"),

    BUY_TOKEN("buyToken"),
    SELL_TOKEN("sellToken"),
    TRANSFER_CONFIRMATION("transferConfirmation"),

    TOP_UP("topUp"),


    STOP("stop"),
    ;

    private String action;
}
