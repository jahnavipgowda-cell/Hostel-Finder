package com.hostelfinder.config;

import com.hostelfinder.model.User;
import com.hostelfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        seedUsers();
        log.info("✅ NestIQ seed data initialised successfully.");
    }

    private void seedUsers() {
        if (userRepository.existsByEmail("admin@nestiq.in")) return;

        // Admin user
        userRepository.save(User.builder()
                .fullName("NestIQ Admin")
                .email("admin@nestiq.in")
                .password(passwordEncoder.encode("admin123"))
                .phoneNumber("+91-9000000001")
                .role(User.Role.ADMIN)
                .preferredCity("Bengaluru")
                .isActive(true)
                .build());

        // Demo regular user
        userRepository.save(User.builder()
                .fullName("Arjun Demo")
                .email("user@nestiq.in")
                .password(passwordEncoder.encode("user123"))
                .phoneNumber("+91-9000000002")
                .role(User.Role.USER)
                .preferredCity("Bengaluru")
                .budgetMin(8000)
                .budgetMax(18000)
                .isActive(true)
                .build());

        // Demo owner user
        userRepository.save(User.builder()
                .fullName("Rahul Owner")
                .email("owner@nestiq.in")
                .password(passwordEncoder.encode("owner123"))
                .phoneNumber("+91-9000000003")
                .role(User.Role.OWNER)
                .preferredCity("Bengaluru")
                .isActive(true)
                .build());

        log.info("👤 Seed users created: admin@nestiq.in / user@nestiq.in / owner@nestiq.in");
    }
}
