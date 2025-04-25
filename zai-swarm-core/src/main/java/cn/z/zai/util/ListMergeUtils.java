package cn.z.zai.util;

import java.util.ArrayList;
import java.util.List;

public class ListMergeUtils {

    public static <T> List<T> mergeAlternating(List<T> list1, List<T> list2) {
        List<T> result = new ArrayList<>();
        int i = 0, j = 0;

        while (i < list1.size() || j < list2.size()) {
            if (i < list1.size())
                result.add(list1.get(i++));
            if (j < list2.size())
                result.add(list2.get(j++));
        }
        return result;
    }
}
