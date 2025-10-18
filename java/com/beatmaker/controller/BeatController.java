package com.beatmaker.controller;

import com.beatmaker.model.Beat;
import com.beatmaker.service.BeatService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/beats")
public class BeatController {
    private final BeatService service;
    public BeatController(BeatService service) { this.service = service; }
    @GetMapping public List<Beat> getAll() { return service.getAll(); }
    @PostMapping public Beat save(@RequestBody Beat beat) { return service.save(beat); }
}
