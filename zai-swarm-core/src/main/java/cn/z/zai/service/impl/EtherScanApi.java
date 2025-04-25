package cn.z.zai.service.impl;

import cn.z.zai.common.constant.EtherScanApiConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.ApiKeyTypeEnum;
import cn.z.zai.dto.request.EtherScanAccountBalanceReq;
import cn.z.zai.dto.request.EtherScanAccountTokenBalanceReq;
import cn.z.zai.dto.request.EtherScanAccountTokentxReq;
import cn.z.zai.dto.request.EtherScanAccountTxlistReq;
import cn.z.zai.dto.request.EtherScanBaseReq;
import cn.z.zai.dto.response.EtherScanAccountTokentxResp;
import cn.z.zai.dto.response.EtherScanAccountTxlistResp;
import cn.z.zai.dto.response.EtherScanResponse;
import cn.z.zai.util.JsonUtil;
import cn.z.zai.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class EtherScanApi implements EtherScanApiConstant {

    private static final String MODULE_ACCOUNT = "account";

    private static final String ACTION_BALANCE = "balance";

    private static final String ACTION_BALANCEMULTI = "balancemulti";

    private static final String ACTION_TXLIST = "txlist";

    private static final String ACTION_TOKENTX = "tokentx";

    private static final String ACTION_TOKENBALANCE = "tokenbalance";

    @Autowired
    private JsonUtil jsonUtil;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Get Ether Balance for a Single Address
     * 
     * @param req
     * @param chainid
     * @return 📖 Tip: The result is returned in wei. Convert Ethereum units using our Unit Converter.
     */
    public String accountBalance(EtherScanAccountBalanceReq req, Integer chainid) {
        req.setChainid(chainid);
        req.setAction(ACTION_BALANCE);
        req.setModule(MODULE_ACCOUNT);
        return responseByRemote(BASE_URL, req, new ParameterizedTypeReference<EtherScanResponse<String>>() {});
    }

    /**
     * Get Ether Balance for Multiple Addresses in a Single Call
     * 
     * @param req
     * @param chainid
     * @return
     */
    public String accountBalancemulti(EtherScanAccountBalanceReq req, Integer chainid) {
        req.setChainid(chainid);
        req.setAction(ACTION_BALANCEMULTI);
        req.setModule(MODULE_ACCOUNT);
        return responseByRemote(BASE_URL, req, new ParameterizedTypeReference<EtherScanResponse<String>>() {});
    }

    /**
     * Get ERC20-Token Account Balance for TokenContractAddress
     *
     * @param req
     * @param chainid
     * @return
     */
    public String accountTokenBalance(EtherScanAccountTokenBalanceReq req, Integer chainid) {
        req.setChainid(chainid);
        req.setAction(ACTION_TOKENBALANCE);
        req.setModule(MODULE_ACCOUNT);
        return responseByRemote(BASE_URL, req, new ParameterizedTypeReference<EtherScanResponse<String>>() {});
    }

    /**
     * Get a list of 'Normal' Transactions By Address
     * 
     * @param req
     * @param chainid
     * @return
     */
    public List<EtherScanAccountTxlistResp> accountTxlist(EtherScanAccountTxlistReq req, Integer chainid) {
        req.setChainid(chainid);
        req.setAction(ACTION_TXLIST);
        req.setModule(MODULE_ACCOUNT);
        return responseByRemote(BASE_URL, req,
            new ParameterizedTypeReference<EtherScanResponse<List<EtherScanAccountTxlistResp>>>() {});
    }

    /**
     * Get a list of 'ERC20 - Token Transfer Events' by Address
     * 
     * @param req
     * @param chainid
     * @return
     */
    public List<EtherScanAccountTokentxResp> accountTokentx(EtherScanAccountTokentxReq req, Integer chainid) {
        req.setChainid(chainid);
        req.setAction(ACTION_TOKENTX);
        req.setModule(MODULE_ACCOUNT);
        return responseByRemote(BASE_URL, req,
            new ParameterizedTypeReference<EtherScanResponse<List<EtherScanAccountTokentxResp>>>() {});
    }

    private <T> T responseByRemote(String url, EtherScanBaseReq request,
        ParameterizedTypeReference<EtherScanResponse<T>> responseType) {
        String apiKey = "";
        request.setApiKey(apiKey);
        try {
            HttpEntity<Object> httpEntity = packageHeaders();
            HashMap hashMap = jsonUtil.string2Obj(jsonUtil.obj2String(request), HashMap.class);
            ResponseEntity<EtherScanResponse<T>> exchange =
                restTemplate.exchange(packageUrlParam(url, hashMap), HttpMethod.GET, httpEntity, responseType);
            EtherScanResponse<T> response = exchange.getBody();
            if (Objects.isNull(response) || !StringUtils.equals(response.getStatus(), "1")) {
                log.error("EtherScan API ERROR:[{}] : {}, {}", url, jsonUtil.obj2String(request),
                    jsonUtil.obj2String(response));
                return null;
            }
            if (response.getResult() == null) {
                log.error("EtherScan API ERROR,Result is NULL:[{}] : {}", url, jsonUtil.obj2String(request));
            }
            return response.getResult();
        } catch (HttpClientErrorException.TooManyRequests tmr) {
            log.error("EtherScan API ERROR:[Too Many Requests][{}][{}],{}", apiKey, url, jsonUtil.obj2String(request));
            String limitKey =
                String.format(RedisCacheConstant.API_KEY_REQUEST_LIMIT, ApiKeyTypeEnum.ETHER_SCAN.getType(), apiKey);
            redisUtil.setEx(limitKey, "1", 1, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("EtherScan API ERROR:[{}],{}", url, jsonUtil.obj2String(request), e);
        }
        return null;
    }

    private String packageUrlParam(String baseUrl, Map<String, Object> map) {
        if (map != null && !map.isEmpty()) {
            StringJoiner joiner = new StringJoiner("&");
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                try {
                    if (value instanceof List<?>) {
                        for (Object obj : (List<?>)value) {
                            if (obj != null && StringUtils.isNotEmpty(obj.toString())) {
                                joiner.add(key + "[]=" + URLEncoder.encode(obj.toString(), "UTF-8"));
                            }
                        }
                    } else if (value instanceof Object[]) {
                        for (Object obj : (Object[])value) {
                            if (obj != null && StringUtils.isNotEmpty(obj.toString())) {
                                joiner.add(key + "[]=" + URLEncoder.encode(obj.toString(), "UTF-8"));
                            }
                        }
                    } else {

                        if (value != null && StringUtils.isNotEmpty(value.toString())) {
                            // joiner.add(key + "=" + URLEncoder.encode(value.toString(), "UTF-8"));
                            joiner.add(key + "=" + value);
                        }
                    }
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
            }
            String separator = baseUrl.contains("?") ? "&" : "?";
            baseUrl = baseUrl + separator + joiner.toString();
        }
        return baseUrl;
    }

    private HttpEntity<Object> packageHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        return new HttpEntity<>(headers);
    }

}
