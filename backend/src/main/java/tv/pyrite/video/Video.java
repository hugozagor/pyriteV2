package tv.pyrite.video;

import jakarta.persistence.*;
import tv.pyrite.user.User;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "videos")
public class Video {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 5000)
    private String description;

    private String hashtags;

    private String category;

    @Column(nullable = false)
    private String videoFile;

    private String thumbnailFile;

    private String contentType;

    private long durationSeconds;

    private long views = 0;

    private boolean featured = false;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "uploader_id")
    private User uploader;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "video_likes", joinColumns = @JoinColumn(name = "video_id"))
    @Column(name = "user_id")
    private Set<Long> likedBy = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "video_dislikes", joinColumns = @JoinColumn(name = "video_id"))
    @Column(name = "user_id")
    private Set<Long> dislikedBy = new HashSet<>();

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHashtags() { return hashtags; }
    public void setHashtags(String hashtags) { this.hashtags = hashtags; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getVideoFile() { return videoFile; }
    public void setVideoFile(String videoFile) { this.videoFile = videoFile; }

    public String getThumbnailFile() { return thumbnailFile; }
    public void setThumbnailFile(String thumbnailFile) { this.thumbnailFile = thumbnailFile; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public long getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(long durationSeconds) { this.durationSeconds = durationSeconds; }

    public long getViews() { return views; }
    public void setViews(long views) { this.views = views; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }

    public Set<Long> getLikedBy() { return likedBy; }
    public void setLikedBy(Set<Long> likedBy) { this.likedBy = likedBy; }

    public Set<Long> getDislikedBy() { return dislikedBy; }
    public void setDislikedBy(Set<Long> dislikedBy) { this.dislikedBy = dislikedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
