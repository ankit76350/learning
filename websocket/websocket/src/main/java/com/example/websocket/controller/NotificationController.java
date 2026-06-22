package com.example.websocket.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
public class NotificationController {

    // Client sends to: /app/sendMessage
    // Subscribers listen on: /topic/cricket or  topic/orders
    @MessageMapping("/sendMessage")
    @SendTo("/topic/notifications")
    public String sendMessage(@Payload String message) {

        log.info("Received message: {}", message);
        return message;
    }

    // Client sends to: /app/studentupdate  ->  broadcast to: /topic/studentupdate
    @MessageMapping("/studentupdate")
    @SendTo("/topic/studentupdate")
    public String studentUpdate(@Payload String message) {
        log.info("Student update: {}", message);
        return message;
    }

    // Client sends to: /app/teacherupdate  ->  broadcast to: /topic/teacherupdate
    @MessageMapping("/teacherupdate")
    @SendTo("/topic/teacherupdate")
    public String teacherUpdate(@Payload String message) {
        log.info("Teacher update: {}", message);
        return message;
    }

    // Client sends to: /app/staffupdate  ->  broadcast to: /topic/staffupdate
    @MessageMapping("/staffupdate")
    @SendTo("/topic/staffupdate")
    public String staffUpdate(@Payload String message) {
        log.info("Staff update: {}", message);
        return message;
    }
}