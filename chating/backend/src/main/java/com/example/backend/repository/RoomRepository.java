package com.example.backend.repository;

import com.example.backend.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends MongoRepository<ChatRoom, String> {
    // Rooms whose "users" list contains the given username.
    List<ChatRoom> findByUsersContaining(String username);
}
