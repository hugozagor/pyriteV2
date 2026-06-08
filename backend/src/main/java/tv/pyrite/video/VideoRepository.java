package tv.pyrite.video;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findAllByOrderByCreatedAtDesc();
    List<Video> findByFeaturedTrueOrderByCreatedAtDesc();
    List<Video> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
    List<Video> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(String title, String description);
    List<Video> findByUploaderIdOrderByCreatedAtDesc(Long uploaderId);
    Optional<Video> findFirstByFeaturedTrueOrderByCreatedAtDesc();
}
