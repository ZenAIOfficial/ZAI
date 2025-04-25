package cn.z.zai.service.impl;

import cn.z.zai.common.constant.BscAddressConstant;
import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.constant.TokenAddressConstant;
import cn.z.zai.dao.TokenSearchDao;
import cn.z.zai.dto.entity.TokenSearch;
import cn.z.zai.dto.request.BirdEyeSearchRequest;
import cn.z.zai.dto.response.BirdEyeSearchResp;
import cn.z.zai.service.TokenSearchService;
import cn.z.zai.singleton.CaffeineCacheSingleton;
import cn.z.zai.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;


@Service
@Slf4j
public class TokenSearchServiceImpl implements TokenSearchService {

    @Autowired
    private TokenSearchDao tokenSearchDao;

    @Autowired
    private BirdEyeApi birdEyeApi;

    @Autowired
    private RedisUtil redisUtil;

    @Override
    public TokenSearch tokenSearch(String address) {

        if (StringUtils.equalsIgnoreCase(address, BscAddressConstant.BNB_ADDRESS)) {
            address = BscAddressConstant.WBNB_ADDRESS;
        }

        TokenSearch tokenSearch = getTokenSearch(address);

        if (Objects.nonNull(tokenSearch)) {
            return tokenSearch;
        }
        BirdEyeSearchRequest req = BirdEyeSearchRequest.builder().keyword(address).build();
        if (StringUtils.equals(TokenAddressConstant.SOL_ADDRESS, address)) {
            req.setKeyword(TokenAddressConstant.WSOL_ADDRESS);
        }
        BirdEyeSearchResp search = birdEyeApi.search(req);
        if (Objects.isNull(search) || CollectionUtils.isEmpty(search.getItems())
            || CollectionUtils.isEmpty(search.getItems().get(0).getResult())) {
            log.error("tokenNetwork birdEyeApi.search 1  resp is empty, param is {}", address);
            return null;
        }
        BirdEyeSearchResp.SearchResp searchResp = search.getItems().get(0).getResult().get(0);

        if (Objects.isNull(searchResp)) {
            log.error("tokenNetwork birdEyeApi.search 2 resp is empty, param is {}", address);
            return null;
        }
        TokenSearch tokenSearchAdd = new TokenSearch();
        tokenSearchAdd.setNetwork(searchResp.getNetwork());
        tokenSearchAdd.setAddress(address);
        tokenSearchAdd.setHitAddress(searchResp.getAddress());
        tokenSearchAdd.setName(searchResp.getName());
        tokenSearchAdd.setSymbol(searchResp.getSymbol());
        tokenSearchAdd.setLogoUri(searchResp.getLogo_uri());
        tokenSearchAdd.setDecimals(searchResp.getDecimals());
        addTokenSearch(tokenSearchAdd);
        return tokenSearchAdd;
    }

    @Override
    public String tokenNetwork(String address) {
        TokenSearch tokenSearch = tokenSearch(address);
        if (Objects.nonNull(tokenSearch)) {
            return tokenSearch.getNetwork();
        }
        return null;
    }


    @Override
    public Long getCreatTime4Api(String address) {
        BirdEyeSearchRequest req = BirdEyeSearchRequest.builder().keyword(address).build();
        if (StringUtils.equals(TokenAddressConstant.SOL_ADDRESS, address)) {
            req.setKeyword(TokenAddressConstant.WSOL_ADDRESS);
        }
        BirdEyeSearchResp search = birdEyeApi.search(req);
        if (Objects.isNull(search) || CollectionUtils.isEmpty(search.getItems())
                || CollectionUtils.isEmpty(search.getItems().get(0).getResult())) {
            log.error("tokenNetwork getCreatTime4Api.  resp is empty, param is {}", address);
            return null;
        }
        BirdEyeSearchResp.SearchResp searchResp = search.getItems().get(0).getResult().get(0);

        if (Objects.isNull(searchResp)) {
            log.error("tokenNetwork getCreatTime4Api resp is empty, param is {}", address);
            return null;
        }
        String creationTime = searchResp.getCreation_time();
        if (StringUtils.isNotEmpty(creationTime)) {
            Instant instant = Instant.parse(creationTime);
            return instant.getEpochSecond();
        }
        return searchResp.getUpdated_time();
    }

    private TokenSearch getTokenSearch(String address) {

        TokenSearch tokenSearchCaffeine = CaffeineCacheSingleton.getInstance().get(address);
        if (Objects.nonNull(tokenSearchCaffeine)) {
            log.info("getTokenSearch info from caffeine {}", address);
            return tokenSearchCaffeine;
        }

        String tokenSearchKey = String.format(RedisCacheConstant.TOKEN_SEARCH, address);

        TokenSearch tokenSearchCache = redisUtil.get(tokenSearchKey, TokenSearch.class);

        if (Objects.nonNull(tokenSearchCache)) {
            log.info("getTokenSearch info from redis{}", address);
            CaffeineCacheSingleton.getInstance().put(address, tokenSearchCache);
            return tokenSearchCache;
        }

        TokenSearch tokenSearch = tokenSearchDao.getTokenSearch(address);

        if (Objects.nonNull(tokenSearch)) {
            log.info("getTokenSearch info from rds{}", address);
            CaffeineCacheSingleton.getInstance().put(address, tokenSearch);
            redisUtil.setExSeconds(tokenSearchKey, tokenSearch, RedisCacheConstant.EXPIRE_TIME_OUT_DAY_3);
            return tokenSearch;
        }
        return null;
    }

    private void addTokenSearch(TokenSearch tokenSearch) {

        try {
            tokenSearchDao.addTokenSearch(tokenSearch);
        } catch (DuplicateKeyException e) {
            log.warn("addTokenSearch DuplicateKey param is {}", tokenSearch);
        }

    }
}
