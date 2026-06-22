package com.example.backend.controller;

import com.example.backend.model.ChatRoom;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;
    private final Random random = new Random();

    @PostMapping
    public ResponseEntity<ChatRoom> createRoom(@RequestBody ChatRoom request) {
        String uniqueId = generateRoomId();
        
        ChatRoom newRoom = new ChatRoom();
        newRoom.setId(uniqueId);
        newRoom.setName(request.getName() != null ? request.getName() : "Chat Room");
        newRoom.setCreatedAt(LocalDateTime.now());

        ChatRoom savedRoom = roomRepository.save(newRoom);
        return new ResponseEntity<>(savedRoom, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllRooms() {
        List<ChatRoom> activeRooms = roomRepository.findAll();
        return ResponseEntity.ok(activeRooms);
    }

    private String generateRoomId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb1 = new StringBuilder();
        StringBuilder sb2 = new StringBuilder();
        
        for (int i = 0; i < 4; i++) {
            sb1.append(chars.charAt(random.nextInt(chars.length())));
            sb2.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return "ROOM-" + sb1.toString() + "-" + sb2.toString();
    }
}
