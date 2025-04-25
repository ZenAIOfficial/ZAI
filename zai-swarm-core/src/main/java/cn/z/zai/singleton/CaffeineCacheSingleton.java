package cn.z.zai.singleton;

import cn.z.zai.common.constant.RedisCacheConstant;
import cn.z.zai.dto.entity.TokenSearch;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.TimeUnit;


@Slf4j
public class CaffeineCacheSingleton {


    private static volatile CaffeineCacheSingleton instance;


    private final Cache<String, TokenSearch> cache;


    private CaffeineCacheSingleton() {
        cache = Caffeine.newBuilder()
                .expireAfterWrite(RedisCacheConstant.EXPIRE_TIME_OUT_HOUR_8, TimeUnit.MINUTES)
                .initialCapacity(10)
                .maximumSize(500)
                .recordStats()
                .removalListener((key, value, cause) -> log.info("Key {} removal, reason:{}", key, cause))
                .build();
    }


    public static CaffeineCacheSingleton getInstance() {
        if (instance == null) {
            synchronized (CaffeineCacheSingleton.class) {
                if (instance == null) {
                    instance = new CaffeineCacheSingleton();
                }
            }
        }
        return instance;
    }


    public void put(String key, TokenSearch value) {
        cache.put(key, value);
    }

    public TokenSearch get(String key) {
        return cache.getIfPresent(key);
    }

    public void invalidate(String key) {
        cache.invalidate(key);
    }

    public String stats() {
        return cache.stats().toString();
    }
}
