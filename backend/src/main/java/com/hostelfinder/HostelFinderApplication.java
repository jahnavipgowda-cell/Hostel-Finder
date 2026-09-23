package com.hostelfinder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class HostelFinderApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelFinderApplication.class, args);
        System.out.println("""
                ╔══════════════════════════════════════════════╗
                ║     🏠 Hostel & PG Finder — 2026 Edition    ║
                ║     Backend running at http://localhost:8080 ║
                ║     Swagger UI: /api/swagger-ui.html         ║
                ╚══════════════════════════════════════════════╝
                """);
    }
}
