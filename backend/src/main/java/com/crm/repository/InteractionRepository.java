package com.crm.repository;

import com.crm.domain.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {

    List<Interaction> findByCustomer_IdOrderByOccurredAtDesc(Long customerId);
}
