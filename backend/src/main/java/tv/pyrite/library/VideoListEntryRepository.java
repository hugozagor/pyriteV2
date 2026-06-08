package tv.pyrite.library;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoListEntryRepository extends JpaRepository<VideoListEntry, Long> {
    List<VideoListEntry> findByUserIdAndKindOrderByAddedAtDesc(Long userId, ListKind kind);
    boolean existsByUserIdAndVideoIdAndKind(Long userId, Long videoId, ListKind kind);
    void deleteByUserIdAndVideoIdAndKind(Long userId, Long videoId, ListKind kind);
    void deleteByVideoId(Long videoId);
    void deleteByUserId(Long userId);
}
