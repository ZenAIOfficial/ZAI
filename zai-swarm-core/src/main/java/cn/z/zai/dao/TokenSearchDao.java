package cn.z.zai.dao;

import cn.z.zai.dto.entity.TokenSearch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface TokenSearchDao {

    void addTokenSearch(TokenSearch tokenSearch);

    TokenSearch getTokenSearch(@Param("address") String address);

}
