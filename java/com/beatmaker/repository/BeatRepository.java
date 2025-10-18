package com.beatmaker.repository;

import com.beatmaker.model.Beat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeatRepository extends JpaRepository<Beat, Long> {}
