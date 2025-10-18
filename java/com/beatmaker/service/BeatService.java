package com.beatmaker.service;

import com.beatmaker.model.Beat;
import com.beatmaker.repository.BeatRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BeatService {
    private final BeatRepository repository;
    public BeatService(BeatRepository repository) { this.repository = repository; }
    public List<Beat> getAll() { return repository.findAll(); }
    public Beat save(Beat beat) { return repository.save(beat); }
}
