package cn.z.zai.service;

import cn.z.zai.dto.request.ZShotTransactionSwapBscReq;
import cn.z.zai.dto.request.ZShotTransactionTransferBscReq;
import cn.z.zai.dto.response.ZShotTransactionResponse;
import cn.z.zai.dto.response.ZShotTransactionSignatureResponse;
import cn.z.zai.dto.so.ZShotTransactionSo;
import cn.z.zai.dto.vo.ZShotTransactionSwapVo;
import cn.z.zai.dto.vo.ZShotTransactionSwapWithTrusteeshipVo;
import cn.z.zai.dto.vo.ZShotTransactionTransferVo;
import cn.z.zai.dto.vo.ZShotTransactionTransferWithTrusteeshipVo;

public interface ZShotTransactionService {



    ZShotTransactionResponse<ZShotTransactionSignatureResponse> transfer(ZShotTransactionTransferVo vo);


    ZShotTransactionResponse<ZShotTransactionSignatureResponse> swap(ZShotTransactionSwapVo vo);


    ZShotTransactionResponse<ZShotTransactionSignatureResponse> sendTransaction(ZShotTransactionSo vo);


    ZShotTransactionResponse<ZShotTransactionSignatureResponse> transferWithTrusteeship(ZShotTransactionTransferWithTrusteeshipVo vo);


    ZShotTransactionResponse<ZShotTransactionSignatureResponse> swapWithTrusteeship(ZShotTransactionSwapWithTrusteeshipVo vo);






    ZShotTransactionResponse<ZShotTransactionSignatureResponse> transfer4BscWithTrusteeship(ZShotTransactionTransferBscReq vo);


    ZShotTransactionResponse<ZShotTransactionSignatureResponse> swap4BscWithTrusteeship(ZShotTransactionSwapBscReq vo);

}
