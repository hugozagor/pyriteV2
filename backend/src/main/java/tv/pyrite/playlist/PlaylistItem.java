package tv.pyrite.playlist;

import jakarta.persistence.*;
import tv.pyrite.video.Video;

import java.time.Instant;

@Entity
@Table(
    name = "playlist_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"playlist_id", "video_id"})
)
public class PlaylistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "playlist_id")
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "video_id")
    private Video video;

    @Column(nullable = false)
    private Instant addedAt = Instant.now();

    public PlaylistItem() {}

    public PlaylistItem(Playlist playlist, Video video) {
        this.playlist = playlist;
        this.video = video;
    }

    public Long getId() { return id; }
    public Playlist getPlaylist() { return playlist; }
    public Video getVideo() { return video; }
    public Instant getAddedAt() { return addedAt; }
}
