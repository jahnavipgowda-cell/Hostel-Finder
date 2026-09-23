package com.hostelfinder.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI hostelFinderOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NestIQ — Hostel & PG Finder API")
                        .description("""
                                Full-stack REST API for NestIQ, India's AI-powered hostel & PG discovery platform (2026 Edition).
                                
                                **Features:**
                                - Location-based search with advanced filters
                                - AI-powered recommendations
                                - Geo-proximity search (Haversine formula)
                                - Verified reviews with AI sentiment analysis
                                - JWT authentication
                                - Real-time notifications via WebSocket
                                - Booking management
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("NestIQ Engineering")
                                .email("dev@nestiq.in")
                                .url("https://nestiq.in"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api").description("Local Development"),
                        new Server().url("https://api.nestiq.in").description("Production")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth", new SecurityScheme()
                                .name("Bearer Auth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token from /auth/login")));
    }
}
