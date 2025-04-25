package cn.z.zai.service.impl;

import cn.z.zai.common.constant.BirdEyeApiConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.ApiKeyTypeEnum;
import cn.z.zai.dto.request.BirdEyeBaseReq;
import cn.z.zai.dto.request.BirdEyeCreationTokenInfoRequest;
import cn.z.zai.dto.request.BirdEyeHolderRequest;
import cn.z.zai.dto.request.BirdEyeOHLCVRequest;
import cn.z.zai.dto.request.BirdEyePriceRequest;
import cn.z.zai.dto.request.BirdEyeSearchRequest;
import cn.z.zai.dto.request.BirdEyeTokenOverviewRequest;
import cn.z.zai.dto.request.BirdEyeTokenSecurityRequest;
import cn.z.zai.dto.request.BirdEyeTradeDataSingleRequest;
import cn.z.zai.dto.response.BirdEyeCreationTokenInfoResponse;
import cn.z.zai.dto.response.BirdEyeHolderResp;
import cn.z.zai.dto.response.BirdEyeOHLCVResponse;
import cn.z.zai.dto.response.BirdEyePriceResponse;
import cn.z.zai.dto.response.BirdEyeResponse;
import cn.z.zai.dto.response.BirdEyeSearchResp;
import cn.z.zai.dto.response.BirdEyeTokenOverviewResponse;
import cn.z.zai.dto.response.BirdEyeTokenSecurityResponse;
import cn.z.zai.dto.response.BirdEyeTradeDataMultipleResponseItem;
import cn.z.zai.service.ApiKeyDetailService;
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
public class BirdEyeApi implements BirdEyeApiConstant {

    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private JsonUtil jsonUtil;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private ApiKeyDetailService apiKeyDetailService;

    public BirdEyeTokenSecurityResponse tokenSecurity(BirdEyeTokenSecurityRequest request){
        return responseByRemote(TOKEN_SECURITY_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeTokenSecurityResponse>>() {});
    }



    public BirdEyeTradeDataMultipleResponseItem tradeDataSingle(BirdEyeTradeDataSingleRequest request){
        return responseByRemote(TOKEN_TRADE_DATA_SINGLE_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeTradeDataMultipleResponseItem>>() {});
    }



    public BirdEyeCreationTokenInfoResponse creationTokenInfo(BirdEyeCreationTokenInfoRequest request){
        return responseByRemote(CREATION_TOKEN_INFO_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeCreationTokenInfoResponse>>() {});
    }



    public BirdEyeOHLCVResponse oHLCV(BirdEyeOHLCVRequest request){
        BirdEyeOHLCVResponse responses =
                responseByRemote(OHLCV_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeOHLCVResponse>>() {});
        return responses;
    }

    /**
     * Get price updates of multiple tokens in a single API call. Maximum 100 tokens
     * @param request
     * @return
     */
    public BirdEyePriceResponse price(BirdEyePriceRequest request){
        BirdEyePriceResponse responses =
                responseByRemote(PRICE_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyePriceResponse>>() {});
        return responses;
    }



    public BirdEyeTokenOverviewResponse tokenOverview(BirdEyeTokenOverviewRequest request){
        BirdEyeTokenOverviewResponse responses =
                responseByRemote(TOKEN_OVERVIEW_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeTokenOverviewResponse>>() {});
        return responses;
    }



    /**
     * search token
     */
    public BirdEyeSearchResp search(BirdEyeSearchRequest request){
        BirdEyeSearchResp responses =
                responseByRemote(TOKEN_SEARCH_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeSearchResp>>() {});
        return responses;
    }

    /**
     * Get top holder list of the given token
     * @param request
     * @return
     */
    public BirdEyeHolderResp holder(BirdEyeHolderRequest request){
        BirdEyeHolderResp responses =
                responseByRemote(TOKEN_HOLDER_URL_GET, request, new ParameterizedTypeReference<BirdEyeResponse<BirdEyeHolderResp>>() {});
        return responses;
    }

    private <T> T responseByRemote(String url,BirdEyeBaseReq request,ParameterizedTypeReference<BirdEyeResponse<T>> responseType) {
        String apiKey = apiKeyDetailService.apiKey(ApiKeyTypeEnum.BIRD_EYE.getType());
        try{
            HttpEntity<Object> httpEntity = packageHeaders(apiKey, request);
            HashMap hashMap = jsonUtil.string2Obj(jsonUtil.obj2String(request), HashMap.class);
            ResponseEntity<BirdEyeResponse<T>> exchange = restTemplate.exchange(
                    packageUrlParam(url, hashMap),
                    //"https://public-api.birdeye.so/defi/v3/token/meta-data/multiple?list_address=ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY,sSo14endRuUbvQaJS3dq36Q829a3A6BEfoeeRGJywEh",
                    HttpMethod.GET,
                    httpEntity,
                    responseType);
            BirdEyeResponse<T> response = exchange.getBody();
            if (response.getSuccess() == null || Boolean.FALSE.equals(response.getSuccess()) || StringUtils.isNotEmpty(response.getMessage())){
                log.error("BirdEye API ERROR:[{}] : {}",url,jsonUtil.obj2String(response));
            }
            if (response.getData() == null){
                log.error("BirdEye API ERROR,Result is NULL:[{}] : {}",url,jsonUtil.obj2String(response));
            }
            return response.getData();
        }catch (HttpClientErrorException.Forbidden fb){
            if (redisUtil.setIfAbsent("BirdEye_API_Forbidden","1",60,TimeUnit.SECONDS)){
                log.error("BirdEye API ERROR:[Forbidden][{}][{}],{}",apiKey, url,jsonUtil.obj2String(request));
            }
        }catch (HttpClientErrorException.TooManyRequests tmr){
            log.error("BirdEye API ERROR:[Too Many Requests][{}][{}],{}",apiKey, url,jsonUtil.obj2String(request));
            String limitKey = String.format(RedisCacheConstant.API_KEY_REQUEST_LIMIT, ApiKeyTypeEnum.BIRD_EYE.getType(), apiKey);
            redisUtil.setEx(limitKey,"1",RedisCacheConstant.API_KEY_REQUEST_LIMIT_TIMEOUT, TimeUnit.SECONDS);
        }catch (Exception e){
            log.error("BirdEye API ERROR:[{}],{}",url,jsonUtil.obj2String(request),e);
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
                    //
                    if (value instanceof List<?>) {
                        for (Object obj : (List<?>) value) {
                            if (obj != null && StringUtils.isNotEmpty(obj.toString())) {
                                joiner.add(key + "[]=" + URLEncoder.encode(obj.toString(), "UTF-8"));
                            }
                        }
                    } else if (value instanceof Object[]) {
                        for (Object obj : (Object[]) value) {
                            if (obj != null && StringUtils.isNotEmpty(obj.toString())) {
                                joiner.add(key + "[]=" + URLEncoder.encode(obj.toString(), "UTF-8"));
                            }
                        }
                    } else {
                        //
                        if (value != null && StringUtils.isNotEmpty(value.toString())) {
                            //joiner.add(key + "=" + URLEncoder.encode(value.toString(), "UTF-8"));
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

    private HttpEntity<Object> packageHeaders(String apiKey, BirdEyeBaseReq request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE,MediaType.APPLICATION_JSON_VALUE);
        headers.set(HEADER_API_KEY_NAME, apiKey);
        if (Objects.nonNull(request) && StringUtils.isNotEmpty(request.getNetwork())) {
            headers.set(HEADER_X_CHAIN_KEY_NAME, request.getNetwork());
        } else {
            headers.set(HEADER_X_CHAIN_KEY_NAME, HEADER_X_CHAIN_KEY_VALUE);
        }
        return new HttpEntity<>(headers);
    }

    private HttpEntity<Object> packageHeaders(Map<String,Object> body,String apiKey , BirdEyeBaseReq request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE,MediaType.APPLICATION_JSON_VALUE);
        headers.set(HEADER_API_KEY_NAME, apiKey);
        if (Objects.nonNull(request) && StringUtils.isNotEmpty(request.getNetwork())) {
            headers.set(HEADER_X_CHAIN_KEY_NAME, request.getNetwork());
        } else {
            headers.set(HEADER_X_CHAIN_KEY_NAME, HEADER_X_CHAIN_KEY_VALUE);
        }
        return new HttpEntity<>(body,headers);
    }
}
