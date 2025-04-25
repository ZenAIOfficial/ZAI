package cn.z.zai.service.impl;

import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.common.enums.OHLCVTypeEnum;
import cn.z.zai.dto.request.BirdEyeOHLCVRequest;
import cn.z.zai.dto.response.BirdEyeOHLCVResponse;
import cn.z.zai.dto.vo.TokenTendencyMaxVo;
import cn.z.zai.dto.vo.TokenTendencyResp;
import cn.z.zai.service.TokenSearchService;
import cn.z.zai.service.TokenTendencyHandleService;
import cn.z.zai.util.RedisUtil;
import cn.z.zai.util.TimeUtil;
import cn.z.zai.util.TokenUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


@Slf4j
@Service
public class TokenTendencyHandleServiceImpl implements TokenTendencyHandleService {

    @Autowired
    private TokenSearchService tokenSearchService;
    @Autowired
    private BirdEyeApi birdEyeApi;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    @Qualifier("commonExecutor")
    private Executor executor;

    @Override
    public void syncHandle(String address) {

        try {
            syncAllTendency(address);

            sync1mTendency(address);

            sync5mTendency(address);

            sync1HTendency(address);

            sync4HTendency(address);
        } catch (Exception e) {
            log.error("TokenTendencyHandleService syncHandle error ", e);
        }


    }

    @Override
    public List<TokenTendencyMaxVo> oneDay(String address, boolean needSync) {

        if (BooleanUtils.isTrue(needSync)) {
            sync5mTendency(address);
            return oneDayList(address);
        }
        return oneDayList(address);
    }

    @Override
    public List<TokenTendencyMaxVo> live(String address) {
        return liveList(address);
    }

    @Override
    public TokenTendencyResp allTendencyLine(String address) {

        if (redisUtil.setIfAbsent(String.format(RedisCacheConstant.OHLCV_ONE_HOURS_UPDATE, address, LocalDate.now()),
                "1", RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_1, TimeUnit.SECONDS)) {
            syncHandle(address);
        }
        TokenTendencyResp tokenTendencyResp = new TokenTendencyResp();
        CompletableFuture<Void> live =
                CompletableFuture.runAsync(() -> tokenTendencyResp.setLive(liveList(address)), executor);
        CompletableFuture<Void> forHours =
                CompletableFuture.runAsync(() -> tokenTendencyResp.setFourHours(fourHoursList(address)), executor);

        CompletableFuture<Void> oneDay =
                CompletableFuture.runAsync(() -> tokenTendencyResp.setOneDay(oneDayList(address)), executor);

        CompletableFuture<Void> oneWeek =
                CompletableFuture.runAsync(() -> tokenTendencyResp.setOneWeek(oneWeekList(address)), executor);

        CompletableFuture<Void> oneMonth =
                CompletableFuture.runAsync(() -> tokenTendencyResp.setOneMonth(oneMonthList(address)), executor);

        CompletableFuture<Void> oneYear =
                CompletableFuture.runAsync(() -> tokenTendencyResp.setOneYear(oneYearList(address)), executor);
        CompletableFuture.allOf(live, forHours, oneDay, oneWeek, oneMonth, oneYear).join();

        maxList(tokenTendencyResp, address);
        return tokenTendencyResp;
    }


    @Override
    public List<TokenTendencyMaxVo> fourHours(String address) {
        return fourHoursList(address);
    }

    @Override
    public List<TokenTendencyMaxVo> oneDay(String address) {
        return oneDayList(address);
    }


    @Override
    public List<TokenTendencyMaxVo> todayTendencyAllDetail(String address, Long blockTime, Boolean needSync) {
        if (BooleanUtils.isTrue(needSync)) {
            syncHandle(address);
        }
        LocalDateTime localDateTime = TimeUtil.epochSeconds2DateTime(blockTime);
        LocalDateTime now = LocalDateTime.now();
        List<TokenTendencyMaxVo> tokenTendencyMaxVos = new ArrayList<>();

        if (!localDateTime.toLocalDate().isBefore(now.toLocalDate())) {
            tokenTendencyMaxVos = fourHours(address);
            tokenTendencyMaxVos.addAll(oneDay(address));
            tokenTendencyMaxVos.sort(Comparator.comparing(TokenTendencyMaxVo::getUnixTime));
            return tokenTendencyMaxVos;
        }

        if (!localDateTime.isBefore(now.minusWeeks(1))) {
            tokenTendencyMaxVos = oneWeekList(address);
            if (CollectionUtils.isEmpty(tokenTendencyMaxVos)) {
                tokenTendencyMaxVos = allTendencyLine(address).getMax();
            }
            tokenTendencyMaxVos.sort(Comparator.comparing(TokenTendencyMaxVo::getUnixTime));
            return tokenTendencyMaxVos;
        }

        if (!localDateTime.isBefore(now.minusMonths(1))) {
            tokenTendencyMaxVos = oneMonthList(address);
            if (CollectionUtils.isEmpty(tokenTendencyMaxVos)) {
                tokenTendencyMaxVos = allTendencyLine(address).getMax();
            }
            tokenTendencyMaxVos.sort(Comparator.comparing(TokenTendencyMaxVo::getUnixTime));
            return tokenTendencyMaxVos;
        }

        if (!localDateTime.isBefore(now.minusYears(1))) {
            tokenTendencyMaxVos = oneYearList(address);
            if (CollectionUtils.isEmpty(tokenTendencyMaxVos)) {
                tokenTendencyMaxVos = allTendencyLine(address).getMax();
            }
            tokenTendencyMaxVos.sort(Comparator.comparing(TokenTendencyMaxVo::getUnixTime));
            return tokenTendencyMaxVos;
        }
        return tokenTendencyMaxVos;
    }


    @Override
    public List<TokenTendencyMaxVo> kPriceByDeadMinute(String address, long deadMinute) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preFourHours = TimeUtil.timestampSeconds(LocalDateTime.now().minusMinutes(deadMinute + 1));
        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.A_MINUTE, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);

        Long aLong = redisUtil.sizeZSet(ohlcvCommonKey);
        if (Objects.isNull(aLong) || aLong < deadMinute) {
            return liveList;
        }

        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preFourHours, now));

        if (CollectionUtils.isEmpty(liveList)) {
            String ohlcvCommonPreKey =
                    ohlcvCachePreKey(address, OHLCVTypeEnum.A_MINUTE, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonPreKey, preFourHours, now));
        }
        return liveList;
    }

    public void syncAllTendency(String address) {
        if (!redisUtil.setIfAbsent(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, LocalDate.now()), "1",
                RedisCacheConstant.EXPIRE_TIME_OUT_DAY_1, TimeUnit.SECONDS)) {
            return;
        }
        try {
            getOHLCVInfoOnline(address, OHLCVTypeEnum.A_MINUTE);
            getOHLCVInfoOnline(address, OHLCVTypeEnum.FIVE_MINUTES);
            getOHLCVInfoOnline(address, OHLCVTypeEnum.AN_HOUR);
            getOHLCVInfoOnline(address, OHLCVTypeEnum.FOUR_HOURS);
            getOHLCVInfoOnline(address, OHLCVTypeEnum.A_DAYS);
            getOHLCVInfoOnline(address, OHLCVTypeEnum.THREE_DAYS);
        } catch (Exception e) {
            redisUtil.delete(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, LocalDate.now()));
            log.error("syncAllTendency error, e  is ", e);
            throw new RuntimeException(e);
        }

    }

    public void sync1mTendency(String address) {
        if (!redisUtil.setIfAbsent(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "1m"), "1", 60L,
                TimeUnit.SECONDS)) {
            return;
        }
        try {
            getOHLCVInfoOnline(address, OHLCVTypeEnum.A_MINUTE);
        } catch (Exception e) {
            redisUtil.delete(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "1m"));
            log.error("sync1mTendency error, e ->", e);
            throw new RuntimeException(e);
        }

        redisUtil.setExSeconds(String.format(RedisCacheConstant.OHLCV_ONE_HOURS_UPDATE, address, LocalDate.now()), "1",
                RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_1);
    }

    public void sync5mTendency(String address) {
        if (!redisUtil.setIfAbsent(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "5m"), "1", 300L,
                TimeUnit.SECONDS)) {
            return;
        }
        try {
            getOHLCVInfoOnline(address, OHLCVTypeEnum.FIVE_MINUTES);
        } catch (Exception e) {
            redisUtil.delete(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "5m"));
            log.error("sync5mTendency error, e ->", e);
            throw new RuntimeException(e);
        }

    }

    public void sync1HTendency(String address) {
        if (!redisUtil.setIfAbsent(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "1H"), "1", 3600L,
                TimeUnit.SECONDS)) {
            return;
        }
        try {
            getOHLCVInfoOnline(address, OHLCVTypeEnum.AN_HOUR);
        } catch (Exception e) {
            redisUtil.delete(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "1H"));
            log.error("sync1HTendency error, e  is", e);
            throw new RuntimeException(e);
        }

    }

    public void sync4HTendency(String address) {
        if (!redisUtil.setIfAbsent(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "4H"), "1", 14400L,
                TimeUnit.SECONDS)) {
            return;
        }
        try {
            getOHLCVInfoOnline(address, OHLCVTypeEnum.FOUR_HOURS);
        } catch (Exception e) {
            redisUtil.delete(String.format(RedisCacheConstant.OHLCV_EXIST_KEY, address, "4H"));
            log.error("sync4HTendency error, e is ", e);
            throw new RuntimeException(e);
        }

    }

    List<TokenTendencyMaxVo> liveList(String address) {

        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preHours = TimeUtil.timestampSeconds(LocalDateTime.now().minusHours(1));

        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.A_MINUTE, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preHours, now));
        if (CollectionUtils.isEmpty(liveList)) {
            String ohlcvCommonPreKey =
                    ohlcvCachePreKey(address, OHLCVTypeEnum.A_MINUTE, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonPreKey, preHours, now));
        }

        return liveList;
    }

    List<TokenTendencyMaxVo> fourHoursList(String address) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preFourHours = TimeUtil.timestampSeconds(LocalDateTime.now().minusHours(4));
        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.A_MINUTE, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);



        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preFourHours, now));

        if (CollectionUtils.isEmpty(liveList)) {
            String ohlcvCommonPreKey =
                    ohlcvCachePreKey(address, OHLCVTypeEnum.A_MINUTE, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonPreKey, preFourHours, now));
        }
        return liveList;
    }

    List<TokenTendencyMaxVo> oneDayList(String address) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preDay = TimeUtil.timestampSeconds(LocalDateTime.now().minusDays(1));
        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.FIVE_MINUTES, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);


        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preDay, now));

        if (CollectionUtils.isEmpty(liveList)) {
            String ohlcvCommonPreKey =
                    ohlcvCachePreKey(address, OHLCVTypeEnum.FIVE_MINUTES, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonPreKey, preDay, now));
        }
        return liveList;
    }

    List<TokenTendencyMaxVo> oneWeekList(String address) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preWeek = TimeUtil.timestampSeconds(LocalDateTime.now().minusWeeks(1));
        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.AN_HOUR, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);

        Long aLong = redisUtil.sizeZSet(ohlcvCommonKey);
        if (Objects.isNull(aLong) || aLong < 160) {
            return liveList;
        }
        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preWeek, now));

        if (CollectionUtils.isEmpty(liveList)) {
            String ohlcvCommonPreKey =
                    ohlcvCachePreKey(address, OHLCVTypeEnum.AN_HOUR, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonPreKey, preWeek, now));
        }
        return liveList;
    }

    List<TokenTendencyMaxVo> oneMonthList(String address) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preMonth = TimeUtil.timestampSeconds(LocalDateTime.now().minusMonths(1));
        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.FOUR_HOURS, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);

        Long aLong = redisUtil.sizeZSet(ohlcvCommonKey);
        if (Objects.isNull(aLong) || aLong < 170) {
            return liveList;
        }
        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preMonth, now));
        return liveList;
    }

    List<TokenTendencyMaxVo> oneYearList(String address) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        long preYears = TimeUtil.timestampSeconds(LocalDateTime.now().minusYears(1));
        List<TokenTendencyMaxVo> liveList = new ArrayList<>();

        String ohlcvCommonKey =
                ohlcvCacheKey(address, OHLCVTypeEnum.A_DAYS, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);

        Long aLong = redisUtil.sizeZSet(ohlcvCommonKey);
        if (Objects.isNull(aLong) || aLong < 350) {
            return liveList;
        }
        buildList(liveList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preYears, now));
        return liveList;
    }

    private void maxList(TokenTendencyResp res, String address) {
        long now = TimeUtil.timestampSeconds(LocalDateTime.now());
        List<TokenTendencyMaxVo> maxList = new ArrayList<>();

        if (CollectionUtils.isNotEmpty(res.getOneYear())) {
            long preYears = TimeUtil.timestampSeconds(LocalDateTime.now().minusYears(1));
            String ohlcvCommonKey =
                    ohlcvCacheKey(address, OHLCVTypeEnum.THREE_DAYS, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(maxList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preYears, now));
            res.setMax(maxList);
            return;
        }
        if (CollectionUtils.isNotEmpty(res.getOneMonth())) {
            long preYears = TimeUtil.timestampSeconds(LocalDateTime.now().minusYears(1));
            String ohlcvCommonKey =
                    ohlcvCacheKey(address, OHLCVTypeEnum.A_DAYS, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(maxList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preYears, now));
            res.setMax(maxList);
            return;
        }
        if (CollectionUtils.isNotEmpty(res.getOneWeek())) {
            long preMonth = TimeUtil.timestampSeconds(LocalDateTime.now().minusMonths(1));
            String ohlcvCommonKey =
                    ohlcvCacheKey(address, OHLCVTypeEnum.FOUR_HOURS, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(maxList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preMonth, now));
            res.setMax(maxList);
            return;
        }
        if (CollectionUtils.isNotEmpty(res.getOneDay())) {
            long preWeek = TimeUtil.timestampSeconds(LocalDateTime.now().minusWeeks(1));
            String ohlcvCommonKey =
                    ohlcvCacheKey(address, OHLCVTypeEnum.AN_HOUR, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(maxList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preWeek, now));
            res.setMax(maxList);
            return;
        }
        if (CollectionUtils.isNotEmpty(res.getFourHours())) {
            long preDay = TimeUtil.timestampSeconds(LocalDateTime.now().minusDays(1));
            String ohlcvCommonKey =
                    ohlcvCacheKey(address, OHLCVTypeEnum.FIVE_MINUTES, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);
            buildList(maxList, redisUtil.reverseRangeByScoreZSet(ohlcvCommonKey, preDay, now));
            res.setMax(maxList);
            return;
        }

    }

    private void buildList(List<TokenTendencyMaxVo> liveList, Set<Object> setCache) {
        if (CollectionUtils.isEmpty(setCache)) {
            return;
        }

        liveList.addAll(
                setCache.stream().filter(obj -> obj instanceof TokenTendencyMaxVo).map(obj -> (TokenTendencyMaxVo) obj)
                        .collect(Collectors.collectingAndThen(
                                Collectors.toCollection(() -> new TreeSet<>(Comparator.comparing(TokenTendencyMaxVo::getUnixTime))),
                                ArrayList::new)));
    }



    private void getOHLCVInfoOnline(String address, OHLCVTypeEnum ohlcvTypeEnum) {
        Long second4fromTime = null;
        String ohlcvCommonKey = ohlcvCacheKey(address, ohlcvTypeEnum, RedisCacheConstant.OHLCV_TENDENCY_COMMON_KEY);

        Set<Object> objectSet = redisUtil.reverseRangeZSet(ohlcvCommonKey, 0L, 1L);
        if (CollectionUtils.isNotEmpty(objectSet)) {
            ArrayList<Object> objects = new ArrayList<>(objectSet);
            Object o = objects.get(0);
            if (o instanceof TokenTendencyMaxVo) {
                second4fromTime = ((TokenTendencyMaxVo) o).getUnixTime();
            }
        }

        BirdEyeOHLCVRequest request = BirdEyeOHLCVRequest.builder().address(address).type(ohlcvTypeEnum.getType())
                .time_from(Objects.isNull(second4fromTime) ? defaultFromTime(ohlcvTypeEnum) : second4fromTime)
                .time_to(TimeUtil.currentEpochSecond4Minute()).build();
        request.setNetwork(tokenSearchService.tokenNetwork(address));
        BirdEyeOHLCVResponse responseCache = birdEyeApi.oHLCV(request);

        if (Objects.nonNull(responseCache) && CollectionUtils.isNotEmpty(responseCache.getItems())) {

            List<TokenTendencyMaxVo> tokenTendencyMaxVoList = TokenUtils.buildByTokenOHLCResponse(responseCache);
            tokenTendencyMaxVoList.parallelStream().forEach(s -> {

                redisUtil.addZSet(ohlcvCommonKey, s, s.getUnixTime(), expiresTime(ohlcvTypeEnum));

            });

        } else {
            log.error("[TokenTendencyHandleService] response is NULL,{}", address);
        }

    }

    private Long defaultFromTime(OHLCVTypeEnum ohlcvTypeEnum) {

        String type = ohlcvTypeEnum.getType();


        if (StringUtils.equals(type, OHLCVTypeEnum.A_MINUTE.getType())) {
            return TimeUtil.timestampSeconds(LocalDateTime.now().minusMinutes(250));
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.FIVE_MINUTES.getType())) {

            return TimeUtil.timestampSeconds(LocalDateTime.now().minusHours(25));
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.AN_HOUR.getType())) {

            return TimeUtil.timestampSeconds(LocalDateTime.now().minusDays(8));
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.FOUR_HOURS.getType())) {

            return TimeUtil.timestampSeconds(LocalDateTime.now().minusDays(31));
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.A_DAYS.getType())) {

            return TimeUtil.timestampSeconds(LocalDateTime.now().minusMonths(13));
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.THREE_DAYS.getType())) {

            return TimeUtil.timestampSeconds(LocalDateTime.now().minusMonths(13));
        }


        return TimeUtil.timestampSeconds(LocalDateTime.now().minusHours(25));

    }

    private Long expiresTime(OHLCVTypeEnum ohlcvTypeEnum) {

        String type = ohlcvTypeEnum.getType();


        if (StringUtils.equals(type, OHLCVTypeEnum.A_MINUTE.getType())) {
            return 24 * 60 * 60L;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.FIVE_MINUTES.getType())) {

            return 24 * 60 * 60L;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.AN_HOUR.getType())) {

            return 7 * 24 * 60 * 60L;
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.FOUR_HOURS.getType())) {

            return 30 * 24 * 60 * 60L;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.A_DAYS.getType())) {

            return 365 * 30 * 24 * 60 * 60L;
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.THREE_DAYS.getType())) {

            return 365 * 30 * 24 * 60 * 60L;
        }


        return 24 * 60 * 60L;
    }

    private String ohlcvCacheKey(String address, OHLCVTypeEnum ohlcvTypeEnum, String fmtKey) {
        LocalDateTime now = LocalDateTime.now();
        String ohlcvCacheKey = String.format(fmtKey, address, ohlcvTypeEnum.getType(), now.toLocalDate());

        String type = ohlcvTypeEnum.getType();


        if (StringUtils.equals(type, OHLCVTypeEnum.A_MINUTE.getType())) {
            return ohlcvCacheKey;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.FIVE_MINUTES.getType())) {

            return ohlcvCacheKey;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.AN_HOUR.getType())) {
            int year = now.getYear();
            WeekFields weekFields = WeekFields.of(Locale.getDefault());
            int weekOfYear = now.get(weekFields.weekOfYear());

            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_w_" + weekOfYear);
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.FOUR_HOURS.getType())) {
            int year = now.getYear();
            int monthValue = now.getMonthValue();
            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_m_" + monthValue);
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.A_DAYS.getType())) {
            int year = now.getYear();
            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_y");
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.THREE_DAYS.getType())) {
            int year = now.getYear();
            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_ymax");
        }


        return ohlcvCacheKey;
    }

    private String ohlcvCachePreKey(String address, OHLCVTypeEnum ohlcvTypeEnum, String fmtKey) {
        LocalDateTime now = LocalDateTime.now();
        String ohlcvCacheKey = String.format(fmtKey, address, ohlcvTypeEnum.getType(), now.toLocalDate().minusDays(1));

        String type = ohlcvTypeEnum.getType();


        if (StringUtils.equals(type, OHLCVTypeEnum.A_MINUTE.getType())) {
            return ohlcvCacheKey;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.FIVE_MINUTES.getType())) {

            return ohlcvCacheKey;
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.AN_HOUR.getType())) {
            int year = now.getYear();
            WeekFields weekFields = WeekFields.of(Locale.getDefault());
            int weekOfYear = now.get(weekFields.weekOfYear()) - 1;

            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_w_" + weekOfYear);
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.FOUR_HOURS.getType())) {
            int year = now.getYear();
            int monthValue = now.getMonthValue() - 1;
            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_m_" + monthValue);
        }

        if (StringUtils.equals(type, OHLCVTypeEnum.A_DAYS.getType())) {
            int year = now.getYear() - 1;
            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_y");
        }


        if (StringUtils.equals(type, OHLCVTypeEnum.THREE_DAYS.getType())) {
            int year = now.getYear() - 1;
            return String.format(fmtKey, address, ohlcvTypeEnum.getType(), year + "_ymax");
        }


        return ohlcvCacheKey;
    }

}
