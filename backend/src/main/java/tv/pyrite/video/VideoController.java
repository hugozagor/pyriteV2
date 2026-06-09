package tv.pyrite.video;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tv.pyrite.comment.CommentRepository;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.history.WatchHistoryEntry;
import tv.pyrite.history.WatchHistoryRepository;
import tv.pyrite.library.VideoListEntryRepository;
import tv.pyrite.playlist.PlaylistItemRepository;
import tv.pyrite.security.CurrentUser;
import tv.pyrite.storage.StorageService;
import tv.pyrite.user.User;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final VideoRepository videoRepository;
    private final CommentRepository commentRepository;
    private final VideoListEntryRepository listRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final WatchHistoryRepository historyRepository;
    private final StorageService storageService;
    private final Mapper mapper;
    private final CurrentUser currentUser;

    public VideoController(VideoRepository videoRepository, CommentRepository commentRepository,
                           VideoListEntryRepository listRepository, PlaylistItemRepository playlistItemRepository,
                           WatchHistoryRepository historyRepository, StorageService storageService,
                           Mapper mapper, CurrentUser currentUser) {
        this.videoRepository = videoRepository;
        this.commentRepository = commentRepository;
        this.listRepository = listRepository;
        this.playlistItemRepository = playlistItemRepository;
        this.historyRepository = historyRepository;
        this.storageService = storageService;
        this.mapper = mapper;
        this.currentUser = currentUser;
    }

    private Long currentUserId() {
        return currentUser.get().map(User::getId).orElse(null);
    }

    /** Home feed: the featured video plus all recent videos (optionally filtered). */
    @GetMapping
    @Transactional(readOnly = true)
    public Dtos.FeedDto feed(@RequestParam(required = false) String category,
                             @RequestParam(required = false) String search,
                             @RequestParam(required = false) Long uploaderId) {
        List<Video> videos;
        if (search != null && !search.isBlank()) {
            videos = videoRepository
                    .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByCreatedAtDesc(search, search);
        } else if (uploaderId != null) {
            videos = videoRepository.findByUploaderIdOrderByCreatedAtDesc(uploaderId);
        } else if (category != null && !category.isBlank() && !"tout".equalsIgnoreCase(category)) {
            videos = videoRepository.findByCategoryIgnoreCaseOrderByCreatedAtDesc(category);
        } else {
            videos = videoRepository.findAllByOrderByCreatedAtDesc();
        }

        Dtos.VideoDetailDto featured = videoRepository.findFirstByFeaturedTrueOrderByCreatedAtDesc()
                .map(v -> mapper.videoDetail(v, currentUserId()))
                .orElse(null);

        return new Dtos.FeedDto(featured, videos.stream().map(mapper::videoSummary).toList());
    }

    /** Videos the current user has liked (literal path wins over /{id}). */
    @GetMapping("/liked")
    @Transactional(readOnly = true)
    public List<Dtos.VideoSummaryDto> liked() {
        return currentUser.get()
                .map(user -> videoRepository.findLikedByUser(user.getId())
                        .stream().map(mapper::videoSummary).toList())
                .orElseGet(List::of);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public Dtos.VideoDetailDto get(@PathVariable Long id) {
        Video v = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        return mapper.videoDetail(v, currentUserId());
    }

    /** Increments the view counter once per playback start. */
    @PostMapping("/{id}/view")
    @Transactional
    public ResponseEntity<Void> registerView(@PathVariable Long id) {
        Video v = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        v.setViews(v.getViews() + 1);
        videoRepository.save(v);

        // Record (or bump) this video in the current user's watch history.
        currentUser.get().ifPresent(user -> {
            WatchHistoryEntry entry = historyRepository.findByUserIdAndVideoId(user.getId(), v.getId())
                    .orElseGet(() -> new WatchHistoryEntry(user, v));
            entry.setWatchedAt(java.time.Instant.now());
            historyRepository.save(entry);
        });
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{id}/like")
    @Transactional
    public Dtos.VideoDetailDto toggleLike(@PathVariable Long id) {
        User user = currentUser.require();
        Video v = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        if (!v.getLikedBy().remove(user.getId())) {
            v.getLikedBy().add(user.getId());
        }
        videoRepository.save(v);
        return mapper.videoDetail(v, user.getId());
    }

    /** Only the administrator may upload videos. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dtos.VideoDetailDto> upload(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hashtags", required = false) String hashtags,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationSeconds", required = false, defaultValue = "0") long durationSeconds,
            @RequestParam(value = "featured", required = false, defaultValue = "false") boolean featured) {

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Le titre est obligatoire");
        }
        User admin = currentUser.require();

        Video v = new Video();
        v.setTitle(title.trim());
        v.setDescription(description);
        v.setHashtags(hashtags);
        v.setCategory(category);
        v.setDurationSeconds(durationSeconds);
        v.setUploader(admin);
        v.setVideoFile(storageService.store(videoFile, "video"));
        v.setContentType(videoFile.getContentType());
        if (thumbnail != null && !thumbnail.isEmpty()) {
            v.setThumbnailFile(storageService.store(thumbnail, "thumb"));
        }
        if (featured) {
            // Only one featured video at a time.
            videoRepository.findByFeaturedTrueOrderByCreatedAtDesc().forEach(existing -> {
                existing.setFeatured(false);
                videoRepository.save(existing);
            });
            v.setFeatured(true);
        }
        Video saved = videoRepository.save(v);
        return ResponseEntity.status(CREATED).body(mapper.videoDetail(saved, admin.getId()));
    }

    /** Ensures only one video carries the "featured" flag at a time. */
    private void setFeaturedExclusive(Video v, boolean featured) {
        if (featured) {
            videoRepository.findByFeaturedTrueOrderByCreatedAtDesc().forEach(existing -> {
                if (!existing.getId().equals(v.getId())) {
                    existing.setFeatured(false);
                    videoRepository.save(existing);
                }
            });
        }
        v.setFeatured(featured);
    }

    /** Lightweight JSON metadata patch (no file changes). */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Dtos.VideoDetailDto update(@PathVariable Long id, @RequestBody Dtos.UpdateVideoRequest req) {
        Video v = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        if (req.title() != null && !req.title().isBlank()) v.setTitle(req.title().trim());
        if (req.description() != null) v.setDescription(req.description());
        if (req.hashtags() != null) v.setHashtags(req.hashtags());
        if (req.category() != null) v.setCategory(req.category());
        if (req.featured() != null) setFeaturedExclusive(v, req.featured());
        return mapper.videoDetail(videoRepository.save(v), currentUserId());
    }

    /**
     * Full edit (admin): metadata plus an optional new thumbnail. Any field left
     * out is unchanged; passing removeThumbnail=true clears the current thumbnail.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Dtos.VideoDetailDto edit(
            @PathVariable Long id,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hashtags", required = false) String hashtags,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestParam(value = "removeThumbnail", required = false, defaultValue = "false") boolean removeThumbnail) {

        Video v = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));

        if (title != null) {
            if (title.isBlank()) throw new ResponseStatusException(BAD_REQUEST, "Le titre est obligatoire");
            v.setTitle(title.trim());
        }
        if (description != null) v.setDescription(description);
        if (hashtags != null) v.setHashtags(hashtags);
        if (category != null) v.setCategory(category);
        if (featured != null) setFeaturedExclusive(v, featured);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String old = v.getThumbnailFile();
            v.setThumbnailFile(storageService.store(thumbnail, "thumb"));
            storageService.delete(old);
        } else if (removeThumbnail && v.getThumbnailFile() != null) {
            storageService.delete(v.getThumbnailFile());
            v.setThumbnailFile(null);
        }

        return mapper.videoDetail(videoRepository.save(v), currentUserId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Video v = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        commentRepository.deleteByVideoId(v.getId());
        listRepository.deleteByVideoId(v.getId());
        playlistItemRepository.deleteByVideoId(v.getId());
        historyRepository.deleteByVideoId(v.getId());
        String videoFile = v.getVideoFile();
        String thumbFile = v.getThumbnailFile();
        videoRepository.delete(v);
        storageService.delete(videoFile);
        storageService.delete(thumbFile);
        return ResponseEntity.noContent().build();
    }
}
