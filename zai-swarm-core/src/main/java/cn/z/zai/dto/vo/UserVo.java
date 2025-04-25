package cn.z.zai.dto.vo;

import cn.z.zai.dto.entity.UserWalletAddress;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.util.List;


@Data
public class UserVo implements Serializable {

    private static final long serialVersionUID = -7187568544317232676L;
    private String token;

    private LocalDate day;

    private BigInteger tgUserId;

    private String tgUserIdStr;

    private String firstName;

    private String lastName;

    private String userName;

    private String languageCode;

    private Boolean isActive;


    /**
     * @see cn.z.zai.common.enums.UserSourceType
     *
     * default: 0  tg
     */
    private Integer source;

    private String address;

    private Long lamports;


    private BigDecimal commission = BigDecimal.ZERO;

    private String salt;

    private String verifyCode;

    private String superiorsAddress;

    private BigInteger superiorsTgUserId;

    private BigDecimal yieldRate;

    private Integer invitedFriends;

    private String shareUrl;

    private String tgInnerShareUrl;

    private Boolean isExport;

    private Long pointsCoin;

    private Boolean inLogOut;


    private List<UserWalletAddress> userWalletAddress;
}
