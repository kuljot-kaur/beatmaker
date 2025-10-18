package com.beatmaker.controller;

import com.beatmaker.model.Beat;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    @MessageMapping("/beat")
    @SendTo("/topic/beats")
    public Beat broadcastBeat(Beat beat) { return beat; }
}
