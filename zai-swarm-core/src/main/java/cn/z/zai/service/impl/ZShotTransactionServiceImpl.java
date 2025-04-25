package cn.z.zai.service.impl;

import cn.z.zai.dto.request.ZShotTransactionSwapBscReq;
import cn.z.zai.dto.request.ZShotTransactionTransferBscReq;
import cn.z.zai.dto.response.ZShotTransactionResponse;
import cn.z.zai.dto.response.ZShotTransactionSignatureResponse;
import cn.z.zai.dto.so.ZShotTransactionSo;
import cn.z.zai.dto.vo.ZShotTransactionSwapVo;
import cn.z.zai.dto.vo.ZShotTransactionSwapWithTrusteeshipVo;
import cn.z.zai.dto.vo.ZShotTransactionTransferVo;
import cn.z.zai.dto.vo.ZShotTransactionTransferWithTrusteeshipVo;
import cn.z.zai.service.ZShotTransactionService;
import cn.z.zai.util.JsonUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class ZShotTransactionServiceImpl implements ZShotTransactionService {

    @Value(value = "${inner.zShotTransactionUrl}")
    private String zShotTransactionUrl;

    @Autowired
    private JsonUtil jsonUtil;

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse> transfer(ZShotTransactionTransferVo vo) {
        try {

            ResponseEntity<String> response = getStringResponseEntity("/outer/wallet/transfer", vo);
            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction transfer result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction transfer success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction transfer catch error :", error);
            return null;
        }
    }

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse> swap(ZShotTransactionSwapVo vo) {
        try {
            ResponseEntity<String> response = getStringResponseEntity("/outer/wallet/swap", vo);
            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction swap result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction swap success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction swap catch error :", error);
            return null;
        }
    }

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse> sendTransaction(ZShotTransactionSo vo) {
        try {

            ResponseEntity<String> response = getStringResponseEntity("/outer/wallet/proxy", vo);
            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction sendTransaction result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction sendTransaction success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction sendTransaction catch error :", error);
            return null;
        }
    }

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse>
        transferWithTrusteeship(ZShotTransactionTransferWithTrusteeshipVo vo) {
        try {
            ResponseEntity<String> response = getStringResponseEntity("/inner/trusteeship/transfer", vo);
            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction trusteeship transfer result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction trusteeship transfer success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction trusteeship transfer catch error :", error);
            return null;
        }
    }

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse>
        swapWithTrusteeship(ZShotTransactionSwapWithTrusteeshipVo vo) {
        try {
            ResponseEntity<String> response = getStringResponseEntity("/inner/trusteeship/swap", vo);
            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction trusteeship swap result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction trusteeship swap success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction trusteeship swap catch error :", error);
            return null;
        }
    }

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse>
        transfer4BscWithTrusteeship(ZShotTransactionTransferBscReq vo) {
        try {
            ResponseEntity<String> response = getStringResponseEntity("/inner/trusteeship/transfer/bsc", vo);
            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction transfer4BscWithTrusteeship result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction transfer4BscWithTrusteeship success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction transfer4BscWithTrusteeship catch error :", error);
            return null;
        }
    }

    @Override
    public ZShotTransactionResponse<ZShotTransactionSignatureResponse>
        swap4BscWithTrusteeship(ZShotTransactionSwapBscReq vo) {
        try {

            ResponseEntity<String> response = getStringResponseEntity("/inner/trusteeship/swap/bsc", vo);

            ZShotTransactionResponse<ZShotTransactionSignatureResponse> result = jsonUtil.string2Obj(response.getBody(),
                new TypeReference<ZShotTransactionResponse<ZShotTransactionSignatureResponse>>() {});
            if (result == null) {
                log.error("zShotTransaction swap4BscWithTrusteeship result null, param is {}", vo);
                return null;
            }
            log.info("zShotTransaction swap4BscWithTrusteeship success : {}", vo);
            return result;
        } catch (Exception error) {
            log.error("zShotTransaction swap4BscWithTrusteeship catch error :", error);
            return null;
        }
    }

    @NotNull
    private ResponseEntity<String> getStringResponseEntity(String uri, Object vo) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody =
            new ObjectMapper().convertValue(vo, new TypeReference<Map<String, Object>>() {});
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        return restTemplate.exchange(zShotTransactionUrl + uri, HttpMethod.POST, requestEntity, String.class);
    }
}
