package cn.z.zai.service.impl;

import cn.z.zai.dto.request.EtherScanAccountBalanceReq;
import cn.z.zai.dto.request.EtherScanAccountTokenBalanceReq;
import cn.z.zai.dto.request.EtherScanAccountTokentxReq;
import cn.z.zai.dto.request.EtherScanAccountTxlistReq;
import cn.z.zai.dto.response.EtherScanAccountTokentxResp;
import cn.z.zai.dto.response.EtherScanAccountTxlistResp;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;


@Slf4j
@Component
public class BSCScanApi {

    private static final Integer CHAINID = 56;

    @Autowired
    private EtherScanApi etherScanApi;

    public String accountBalance(EtherScanAccountBalanceReq req) {

        return etherScanApi.accountBalance(req, CHAINID);
    }

    public String accountBalancemulti(EtherScanAccountBalanceReq req) {
        return etherScanApi.accountBalancemulti(req, CHAINID);
    }

    public String accountTokenBalance(EtherScanAccountTokenBalanceReq req) {
        req.setTag("latest");
        return etherScanApi.accountTokenBalance(req, CHAINID);
    }

    public List<EtherScanAccountTxlistResp> accountTxlist(EtherScanAccountTxlistReq req) {
        return etherScanApi.accountTxlist(req, CHAINID);
    }

    public List<EtherScanAccountTokentxResp> accountTokentx(EtherScanAccountTokentxReq req) {
        return etherScanApi.accountTokentx(req, CHAINID);
    }
}
