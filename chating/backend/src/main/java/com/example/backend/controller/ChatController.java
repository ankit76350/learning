package com.example.backend.controller;

import com.example.backend.model.ChatMessage;
import com.example.backend.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * WebSocket: a client publishes to /app/chat/{roomId}. We stamp the
     * message, persist it, and broadcast it to everyone subscribed to
     * /topic/room/{roomId}.
     */
    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, @Payload ChatMessage incoming) {
        ChatMessage message = new ChatMessage();
        message.setRoomId(roomId);
        message.setSender(incoming.getSender());
        message.setContent(incoming.getContent());
        message.setTimestamp(LocalDateTime.now());

        ChatMessage saved = messageRepository.save(message);

        //! message, persist it, and broadcast it to everyone subscribed to /topic/room/{roomId}.
        messagingTemplate.convertAndSend("/topic/room/" + roomId, saved);
    }

    /**
     * REST: fetch a room's message history (oldest first), e.g. to populate
     * the chat when a user opens the room.
     */
    @GetMapping("/api/messages/{roomId}")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable String roomId) {
        return ResponseEntity.ok(messageRepository.findByRoomIdOrderByTimestampAsc(roomId));
    }
}
