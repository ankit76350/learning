package com.example.backend.repository;

import com.example.backend.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<ChatMessage, String> {
    // All messages for a room, oldest first.
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);
}
