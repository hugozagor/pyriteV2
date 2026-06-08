package tv.pyrite.library;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.security.CurrentUser;
import tv.pyrite.user.User;
import tv.pyrite.video.Video;
import tv.pyrite.video.VideoRepository;

import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Personal video lists for the signed-in user: "watch-later" and "saved".
 * Add/remove are idempotent so the UI can simply toggle.
 */
@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final VideoListEntryRepository listRepository;
    private final VideoRepository videoRepository;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public LibraryController(VideoListEntryRepository listRepository, VideoRepository videoRepository,
                             CurrentUser currentUser, Mapper mapper) {
        this.listRepository = listRepository;
        this.videoRepository = videoRepository;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    @GetMapping("/{kind}")
    @Transactional(readOnly = true)
    public List<Dtos.VideoSummaryDto> list(@PathVariable String kind) {
        User user = currentUser.require();
        return listRepository.findByUserIdAndKindOrderByAddedAtDesc(user.getId(), ListKind.fromSlug(kind))
                .stream()
                .map(e -> mapper.videoSummary(e.getVideo()))
                .toList();
    }

    @PostMapping("/{kind}/{videoId}")
    @Transactional
    public ResponseEntity<Void> add(@PathVariable String kind, @PathVariable Long videoId) {
        User user = currentUser.require();
        ListKind listKind = ListKind.fromSlug(kind);
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        if (!listRepository.existsByUserIdAndVideoIdAndKind(user.getId(), videoId, listKind)) {
            listRepository.save(new VideoListEntry(user, video, listKind));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{kind}/{videoId}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable String kind, @PathVariable Long videoId) {
        User user = currentUser.require();
        listRepository.deleteByUserIdAndVideoIdAndKind(user.getId(), videoId, ListKind.fromSlug(kind));
        return ResponseEntity.noContent().build();
    }
}
