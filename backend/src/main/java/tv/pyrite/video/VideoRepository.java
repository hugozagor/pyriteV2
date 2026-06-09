package tv.pyrite.video;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    /** Title matches for autocomplete, most-viewed first (filtered/limited in the controller). */
    List<Video> findByTitleContainingIgnoreCaseOrderByViewsDesc(String title);

    /** One-time backfill: give legacy videos (created before the column existed) a default language. */
    @Modifying
    @Query("update Video v set v.language = 'fr' where v.language is null")
    int backfillNullLanguage();
}
