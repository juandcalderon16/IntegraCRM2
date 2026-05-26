package com.crm.repository;

import com.crm.domain.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    long countByStatus(String status);

    List<Customer> findByOwner_Id(Long ownerId);
}
