package com.hostelfinder.service;

import com.hostelfinder.dto.HostelDTOs.*;
import com.hostelfinder.model.Hostel;
import com.hostelfinder.repository.HostelRepository;
import com.hostelfinder.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class HostelServiceTest {

    @Mock
    private HostelRepository hostelRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private HostelService hostelService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Hostel buildHostel() {
        return Hostel.builder()
                .id(1L)
                .name("Test PG")
                .type(Hostel.HostelType.PG)
                .genderType(Hostel.GenderType.MIXED)
                .city("Bengaluru")
                .locality("Koramangala")
                .address("5th Block, Koramangala")
                .pricePerMonth(new BigDecimal("12000"))
                .availableRooms(5)
                .totalRooms(20)
                .rating(new BigDecimal("4.5"))
                .totalReviews(100)
                .verified(true)
                .aiRecommended(true)
                .isActive(true)
                .build();
    }

    @Test
    void searchHostels_returnsResults() {
        Hostel hostel = buildHostel();
        Page<Hostel> mockPage = new PageImpl<>(List.of(hostel));

        when(hostelRepository.advancedSearch(any(), any(), any(), any(), any(), any()))
                .thenReturn(mockPage);

        SearchRequest req = new SearchRequest();
        req.setQuery("Koramangala");
        req.setPage(0);
        req.setSize(12);

        Page<HostelSummaryResponse> result = hostelService.searchHostels(req);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Test PG");
        assertThat(result.getContent().get(0).getCity()).isEqualTo("Bengaluru");
    }

    @Test
    void getHostelById_returnsDetail() {
        Hostel hostel = buildHostel();

        when(hostelRepository.findById(1L)).thenReturn(Optional.of(hostel));
        when(reviewRepository.findByHostelIdAndIsActiveTrueOrderByHelpfulCountDesc(1L))
                .thenReturn(List.of());

        HostelDetailResponse detail = hostelService.getHostelById(1L);

        assertThat(detail).isNotNull();
        assertThat(detail.getId()).isEqualTo(1L);
        assertThat(detail.getName()).isEqualTo("Test PG");
        assertThat(detail.getRating()).isEqualByComparingTo("4.5");
    }

    @Test
    void getHostelById_throwsWhenNotFound() {
        when(hostelRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> hostelService.getHostelById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllCities_returnsCities() {
        when(hostelRepository.findAllActiveCities()).thenReturn(List.of("Bengaluru", "Mumbai", "Delhi"));

        List<String> cities = hostelService.getAllCities();

        assertThat(cities).containsExactly("Bengaluru", "Mumbai", "Delhi");
    }

    @Test
    void getSearchStats_returnsStats() {
        Hostel h1 = buildHostel();
        Hostel h2 = buildHostel();
        h2.setVerified(false);
        h2.setPricePerMonth(new BigDecimal("8000"));

        when(hostelRepository.findTopRatedByCity(eq("Bengaluru"), any()))
                .thenReturn(List.of(h1, h2));
        when(hostelRepository.countAvailableRoomsByCity("Bengaluru")).thenReturn(10L);

        SearchStatsResponse stats = hostelService.getSearchStats("Bengaluru");

        assertThat(stats.getTotalHostels()).isEqualTo(2L);
        assertThat(stats.getAvailableRooms()).isEqualTo(10L);
        assertThat(stats.getVerifiedCount()).isEqualTo(1L);
    }
}
