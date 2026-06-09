package tv.pyrite.history;

import jakarta.persistence.*;
import tv.pyrite.user.User;
import tv.pyrite.video.Video;

import java.time.Instant;

/** One row per (user, video): the last time that user watched that video. */
@Entity
@Table(
    name = "watch_history",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "video_id"})
)
public class WatchHistoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "video_id")
    private Video video;

    @Column(nullable = false)
    private Instant watchedAt = Instant.now();

    public WatchHistoryEntry() {}

    public WatchHistoryEntry(User user, Video video) {
        this.user = user;
        this.video = video;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Video getVideo() { return video; }
    public Instant getWatchedAt() { return watchedAt; }
    public void setWatchedAt(Instant watchedAt) { this.watchedAt = watchedAt; }
}
