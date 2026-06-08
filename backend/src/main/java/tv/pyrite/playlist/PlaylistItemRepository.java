package tv.pyrite.playlist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaylistItemRepository extends JpaRepository<PlaylistItem, Long> {
    List<PlaylistItem> findByPlaylistIdOrderByAddedAtDesc(Long playlistId);
    long countByPlaylistId(Long playlistId);
    boolean existsByPlaylistIdAndVideoId(Long playlistId, Long videoId);
    Optional<PlaylistItem> findFirstByPlaylistIdOrderByAddedAtDesc(Long playlistId);
    void deleteByPlaylistIdAndVideoId(Long playlistId, Long videoId);
    void deleteByPlaylistId(Long playlistId);
    void deleteByVideoId(Long videoId);

    // Whether any of the given owner's playlists contains the video (button state).
    boolean existsByPlaylistOwnerIdAndVideoId(Long ownerId, Long videoId);
    void deleteByPlaylistOwnerId(Long ownerId);
}
