package cn.z.zai.util;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.Objects;

public class CommonUtils {

    public static BigDecimal getTokenValuePrice(BigDecimal price, BigInteger amount, Integer decimal, Integer scale) {
        if (price == null) {
            return BigDecimal.ZERO;
        }
        if (Objects.isNull(scale)) {
            scale = 4;
        }
        BigDecimal multiplyValue = price.multiply(new BigDecimal(amount));
        return multiplyValue.divide(BigDecimal.valueOf(Math.pow(10, decimal)), scale, RoundingMode.HALF_UP);
    }

    public static BigDecimal getTokens(BigInteger amount, Integer decimal, Integer decimals) {

        if (Objects.isNull(amount) || amount.compareTo(BigInteger.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (Objects.isNull(decimal) || Objects.equals(decimal, 0L)) {
            return BigDecimal.ZERO;
        }


        return new BigDecimal(amount).divide(BigDecimal.valueOf(Math.pow(10, decimal)), decimals, RoundingMode.HALF_UP);
    }

    public static BigDecimal getTokens(BigInteger amount, Integer decimal) {

        if (Objects.isNull(amount) || amount.compareTo(BigInteger.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        if (Objects.isNull(decimal) || Objects.equals(decimal, 0L)) {
            return BigDecimal.ZERO;
        }



        return new BigDecimal(amount).divide(BigDecimal.valueOf(Math.pow(10, decimal)), 6, RoundingMode.HALF_UP);
    }
    public static Long getAmount(BigDecimal tokens, Integer decimal) {

        if (Objects.isNull(tokens)) {
            return 0L;
        }
        if (Objects.isNull(decimal) || Objects.equals(decimal, 0L)) {
            return 0L;
        }

        return tokens.multiply(BigDecimal.valueOf(Math.pow(10, decimal))).longValue();

    }

}
