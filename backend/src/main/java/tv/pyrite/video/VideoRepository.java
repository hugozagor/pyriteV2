package tv.pyrite.video;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findAllByOrderByCreatedAtDesc();
    List<Video> findByFeaturedTrueOrderByCreatedAtDesc();
    List<Video> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
    List<Video> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(String title, String description);
    List<Video> findByUploaderIdOrderByCreatedAtDesc(Long uploaderId);
    Optional<Video> findFirstByFeaturedTrueOrderByCreatedAtDesc();

    /** Videos liked by the given user, most recently created first. */
    @Query("select v from Video v where :userId member of v.likedBy order by v.createdAt desc")
    List<Video> findLikedByUser(@Param("userId") Long userId);

    /** Top suggestions for autocomplete: title match, most-viewed first. */
    List<Video> findTop8ByTitleContainingIgnoreCaseOrderByViewsDesc(String title);
}
