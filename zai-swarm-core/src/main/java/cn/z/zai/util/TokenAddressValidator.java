package cn.z.zai.util;

import cn.hutool.core.codec.Base58;

public class TokenAddressValidator {

    public static boolean isValidSolanaAddress(String address) {

        if (address == null) {
            return false;
        }
        try {

            byte[] decoded = Base58.decode(address);

            return decoded.length == 32;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static boolean isValidBscAddress(String address) {

        if (address == null || !address.matches("^0x[0-9a-fA-F]{40}$")) {
            return false;
        }
        return true;
    }

}
