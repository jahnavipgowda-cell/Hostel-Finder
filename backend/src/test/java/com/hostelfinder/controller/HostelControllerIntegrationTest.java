package com.hostelfinder.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HostelControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void searchHostels_returnsOk() throws Exception {
        mockMvc.perform(get("/hostels/search")
                        .param("query", "Bengaluru")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getAllCities_returnsOk() throws Exception {
        mockMvc.perform(get("/hostels/cities")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void searchByType_returnsFiltered() throws Exception {
        mockMvc.perform(get("/hostels/search")
                        .param("query", "Bengaluru")
                        .param("type", "PG")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void register_returnsJwt() throws Exception {
        String body = """
                {
                  "fullName": "Test User",
                  "email": "testuser99@nestiq.in",
                  "password": "password123"
                }
                """;
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void login_withBadCredentials_returns4xx() throws Exception {
        String body = """
                {
                  "email": "nobody@nestiq.in",
                  "password": "wrongpass"
                }
                """;
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().is4xxClientError());
    }
}
