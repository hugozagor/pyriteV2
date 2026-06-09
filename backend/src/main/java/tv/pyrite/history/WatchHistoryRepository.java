package tv.pyrite.history;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchHistoryRepository extends JpaRepository<WatchHistoryEntry, Long> {
    List<WatchHistoryEntry> findByUserIdOrderByWatchedAtDesc(Long userId);
    Optional<WatchHistoryEntry> findByUserIdAndVideoId(Long userId, Long videoId);
    void deleteByUserIdAndVideoId(Long userId, Long videoId);
    void deleteByUserId(Long userId);
    void deleteByVideoId(Long videoId);
}
