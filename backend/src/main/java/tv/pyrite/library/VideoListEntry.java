package tv.pyrite.library;

import jakarta.persistence.*;
import tv.pyrite.user.User;
import tv.pyrite.video.Video;

import java.time.Instant;

@Entity
@Table(
    name = "video_list_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "video_id", "kind"})
)
public class VideoListEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "video_id")
    private Video video;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListKind kind;

    @Column(nullable = false)
    private Instant addedAt = Instant.now();

    public VideoListEntry() {}

    public VideoListEntry(User user, Video video, ListKind kind) {
        this.user = user;
        this.video = video;
        this.kind = kind;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Video getVideo() { return video; }
    public ListKind getKind() { return kind; }
    public Instant getAddedAt() { return addedAt; }
}
