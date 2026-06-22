package com.example.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoom {
    @Id
    private String id; // Unique Room ID / Invitation code
    private String name;
    private LocalDateTime createdAt;
    private List<String> users = new ArrayList<>(); // names of users in the room
}
