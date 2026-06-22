package com.example.backend.repository;

import com.example.backend.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends MongoRepository<ChatRoom, String> {
}
