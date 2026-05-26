package com.crm.repository;

import com.crm.domain.Prospect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

public interface ProspectRepository extends JpaRepository<Prospect, Long> {

    long countByStageNotIn(Collection<String> stages);

    long countByStage(String stage);

    List<Prospect> findByOwner_Id(Long ownerId);

    @Query("select coalesce(sum(p.amount), 0) from Prospect p where p.stage = :stage")
    BigDecimal sumAmountByStage(@Param("stage") String stage);
}
