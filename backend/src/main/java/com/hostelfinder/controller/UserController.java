package com.hostelfinder.controller;

import com.hostelfinder.model.User;
import com.hostelfinder.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile and preferences management")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    private static final ResponseEntity<Map<String, String>> NOT_AUTHENTICATED =
            ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));

    /**
     * The JWT auth filter (see SecurityConfig) sets the authenticated
     * principal's name to the user's email address. We resolve the real
     * logged-in user from that instead of a hardcoded id, so every account
     * sees its own profile rather than always seeing user #1.
     *
     * NOTE: this deliberately uses plain if/Optional checks rather than
     * Optional#map(...).orElseGet(...) chains. Each branch here returns a
     * different generic type (ResponseEntity<User> vs ResponseEntity<Map>),
     * and javac's target-type inference for method-reference/lambda chains
     * on ResponseEntity<?> cannot reconcile those two bounds ("bad return
     * type in lambda expression, inference variable T has incompatible
     * bounds"). Splitting into explicit statements sidesteps that entirely.
     */
    private Optional<User> currentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return Optional.empty();
        }
        return userRepository.findByEmail(authentication.getName());
    }

    @GetMapping("/me")
    @Operation(summary = "Get logged-in user's profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        Optional<User> userOpt = currentUser(authentication);
        if (userOpt.isEmpty()) {
            return NOT_AUTHENTICATED;
        }
        return ResponseEntity.ok(userOpt.get());
    }

    @PutMapping("/me")
    @Operation(summary = "Update user profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = currentUser(authentication);
        if (userOpt.isEmpty()) {
            return NOT_AUTHENTICATED;
        }

        User user = userOpt.get();
        if (updates.containsKey("fullName"))
            user.setFullName((String) updates.get("fullName"));
        if (updates.containsKey("phoneNumber"))
            user.setPhoneNumber((String) updates.get("phoneNumber"));
        if (updates.containsKey("preferredCity"))
            user.setPreferredCity((String) updates.get("preferredCity"));
        if (updates.containsKey("budgetMin"))
            user.setBudgetMin((Integer) updates.get("budgetMin"));
        if (updates.containsKey("budgetMax"))
            user.setBudgetMax((Integer) updates.get("budgetMax"));

        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/me/saved")
    @Operation(summary = "Get saved/wishlisted hostels")
    public ResponseEntity<?> getSavedHostels(Authentication authentication) {
        Optional<User> userOpt = currentUser(authentication);
        if (userOpt.isEmpty()) {
            return NOT_AUTHENTICATED;
        }
        return ResponseEntity.ok(Map.of("savedHostelIds", userOpt.get().getSavedHostelIds()));
    }

    @PostMapping("/me/saved/{hostelId}")
    @Operation(summary = "Save a hostel to wishlist")
    public ResponseEntity<?> saveHostel(Authentication authentication, @PathVariable Long hostelId) {
        Optional<User> userOpt = currentUser(authentication);
        if (userOpt.isEmpty()) {
            return NOT_AUTHENTICATED;
        }

        User user = userOpt.get();
        if (!user.getSavedHostelIds().contains(hostelId)) {
            user.getSavedHostelIds().add(hostelId);
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Hostel saved to wishlist"));
    }

    @DeleteMapping("/me/saved/{hostelId}")
    @Operation(summary = "Remove hostel from wishlist")
    public ResponseEntity<?> unsaveHostel(Authentication authentication, @PathVariable Long hostelId) {
        Optional<User> userOpt = currentUser(authentication);
        if (userOpt.isEmpty()) {
            return NOT_AUTHENTICATED;
        }

        User user = userOpt.get();
        user.getSavedHostelIds().remove(hostelId);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Hostel removed from wishlist"));
    }
}
