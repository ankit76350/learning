package com.example.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // !topic for brodcasting the message
        config.enableSimpleBroker("/topic");
        // topic/cricket
        // topic/orders


        //! app for client to acess the message
        config.setApplicationDestinationPrefixes("/app");
        // -> /app/<url>
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //! this endpoint used to established the connection by the client
        //! this is for websocket connection
        registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*")
        .withSockJS();
    }

}
