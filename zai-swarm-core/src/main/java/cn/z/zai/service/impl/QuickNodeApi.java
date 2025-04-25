package cn.z.zai.service.impl;

import cn.z.zai.common.constant.QuickNodeApiConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.ApiKeyTypeEnum;
import cn.z.zai.dto.request.QuickNodeRequest;
import cn.z.zai.dto.response.QuickNodeResponse;
import cn.z.zai.dto.response.QuickNodeResponseBalance;
import cn.z.zai.dto.response.QuickNodeResponseSignatureStatusesItem;
import cn.z.zai.dto.response.QuickNodeResponseTokenAccountsByOwnerItem;
import cn.z.zai.dto.response.QuickNodeSignatureInformation;
import cn.z.zai.util.JsonUtil;
import cn.z.zai.util.RedisUtil;
import com.google.common.collect.Lists;
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
import java.util.StringJoiner;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class QuickNodeApi implements QuickNodeApiConstant {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private JsonUtil jsonUtil;
    @Autowired
    private RedisUtil redisUtil;

    /**
     * https://www.quicknode.com/docs/solana/getTransaction
     */
    public QuickNodeResponseTokenAccountsByOwnerItem getTokenAccountsByOwner(String walletAddress, String programId) {
        HashMap<String, Object> programMap = new HashMap<>();
        programMap.put("programId", programId);
        HashMap<String, Object> map = new HashMap<>();
        map.put("encoding", "jsonParsed");
        QuickNodeRequest request = new QuickNodeRequest();
        request.setMethod("getTokenAccountsByOwner");
        request.setParams(Lists.newArrayList(walletAddress, programMap, map));
        QuickNodeResponseTokenAccountsByOwnerItem responses = responseByRemotePost(null, request,
            new ParameterizedTypeReference<QuickNodeResponse<QuickNodeResponseTokenAccountsByOwnerItem>>() {});
        return responses;
    }

    /**
     * https://www.quicknode.com/docs/solana/getBalance
     */
    public QuickNodeResponseBalance getBalance(String address) {
        QuickNodeRequest request = new QuickNodeRequest();
        request.setMethod("getBalance");
        request.setParams(Lists.newArrayList(address));
        QuickNodeResponseBalance responses = responseByRemotePost(null, request,
            new ParameterizedTypeReference<QuickNodeResponse<QuickNodeResponseBalance>>() {});
        return responses;
    }

    /**
     * https://solana.com/docs/rpc/http/getsignaturestatuses
     */
    public QuickNodeResponseSignatureStatusesItem getSignatureStatuses(String txHash) {
        HashMap<String, Object> programMap = new HashMap<>();
        programMap.put("searchTransactionHistory", true);
        HashMap<String, Object> map = new HashMap<>();
        map.put("encoding", "jsonParsed");
        QuickNodeRequest request = new QuickNodeRequest();
        request.setMethod("getSignatureStatuses");
        request.setParams(Lists.newArrayList(Lists.newArrayList(txHash), programMap));
        QuickNodeResponseSignatureStatusesItem responses = responseByRemotePost(null, request,
            new ParameterizedTypeReference<QuickNodeResponse<QuickNodeResponseSignatureStatusesItem>>() {});
        return responses;
    }

    /**
     * https://www.quicknode.com/docs/solana/getSignaturesForAddress
     */
    public List<QuickNodeSignatureInformation> getSignaturesForAddress(String address, String before, String until) {
        HashMap<String, Object> map = new HashMap<>();
        if (StringUtils.isNotEmpty(before)) {
            map.put("before", before);
        }
        if (StringUtils.isNotEmpty(until)) {
            map.put("until", until);
        }
        map.put("limit", 1000);
        QuickNodeRequest request = new QuickNodeRequest();
        request.setMethod("getSignaturesForAddress");
        request.setParams(Lists.newArrayList(address, map));
        List<QuickNodeSignatureInformation> responses = responseByRemotePost(null, request,
            new ParameterizedTypeReference<QuickNodeResponse<List<QuickNodeSignatureInformation>>>() {});
        return responses;
    }

    private <T> T responseByRemotePost(Object request, Object body,
        ParameterizedTypeReference<QuickNodeResponse<T>> responseType) {
        String apiKey = "";
        String url = String.format(URL_POST_NEW, apiKey);
        try {
            HttpEntity<Object> httpEntity =
                packageHeaders(jsonUtil.string2Obj(jsonUtil.obj2String(body), HashMap.class));
            HashMap hashMap = jsonUtil.string2Obj(jsonUtil.obj2String(request), HashMap.class);
            ResponseEntity<QuickNodeResponse<T>> exchange =
                restTemplate.exchange(packageUrlParam(url, hashMap), HttpMethod.POST, httpEntity, responseType);
            QuickNodeResponse<T> response = exchange.getBody();
            if (response == null || response.getResult() == null || response.getError() != null) {
                log.error("QuickNode API ERROR,Result:[{}], body:[{}], : {}", url, body, jsonUtil.obj2String(response));
            }
            return response.getResult();
        } catch (HttpClientErrorException.Forbidden fb) {
            if (redisUtil.setIfAbsent("QuickNode_API_Forbidden", "1", 60, TimeUnit.SECONDS)) {
                log.error("QuickNode API ERROR:[Forbidden][{}][{}], body:[{}],{}", apiKey, url, body,
                    jsonUtil.obj2String(request));

            }
        } catch (HttpClientErrorException.TooManyRequests tmr) {
            log.error("QuickNode API ERROR:[Too Many Requests][{}][{}], body:[{}],{}", apiKey, url, body,
                jsonUtil.obj2String(request));
            String limitKey =
                String.format(RedisCacheConstant.API_KEY_REQUEST_LIMIT, ApiKeyTypeEnum.QUICK_NODE.getType(), apiKey);
            redisUtil.setEx(limitKey, "1", RedisCacheConstant.API_KEY_REQUEST_LIMIT_TIMEOUT, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("QuickNode API ERROR:[{}], body:[{}],{}", url, body, jsonUtil.obj2String(body), e);
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
                            joiner.add(key + "=" + URLEncoder.encode(value.toString(), "UTF-8"));
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

    private HttpEntity<Object> packageHeaders(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        return new HttpEntity<>(body, headers);
    }
}
