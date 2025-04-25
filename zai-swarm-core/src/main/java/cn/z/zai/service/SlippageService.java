package cn.z.zai.service;



import cn.z.zai.dto.entity.SlippageVo;

import java.math.BigInteger;

public interface SlippageService {

    SlippageVo userSlippage(BigInteger tgUserId);

    Integer buySlippage(BigInteger tgUserId);

    Integer sellSlippage(BigInteger tgUserId);

    void updateSlippage(SlippageVo slippageVo);


}
