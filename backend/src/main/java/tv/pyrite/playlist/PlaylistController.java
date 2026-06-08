package tv.pyrite.playlist;

import jakarta.validation.Valid;
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

import static org.springframework.http.HttpStatus.*;

/** Personal playlists for the signed-in user. */
@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    private final PlaylistRepository playlistRepository;
    private final PlaylistItemRepository itemRepository;
    private final VideoRepository videoRepository;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public PlaylistController(PlaylistRepository playlistRepository, PlaylistItemRepository itemRepository,
                              VideoRepository videoRepository, CurrentUser currentUser, Mapper mapper) {
        this.playlistRepository = playlistRepository;
        this.itemRepository = itemRepository;
        this.videoRepository = videoRepository;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    /** Loads a playlist and verifies the current user owns it. */
    private Playlist ownedPlaylist(Long id, User user) {
        Playlist p = playlistRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Playlist introuvable"));
        if (!p.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(NOT_FOUND, "Playlist introuvable");
        }
        return p;
    }

    /** Lists my playlists. With ?videoId=, each entry says whether it contains that video. */
    @GetMapping
    @Transactional(readOnly = true)
    public List<Dtos.PlaylistDto> list(@RequestParam(required = false) Long videoId) {
        User user = currentUser.require();
        return playlistRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(p -> mapper.playlist(p, videoId)).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public Dtos.PlaylistDetailDto get(@PathVariable Long id) {
        return mapper.playlistDetail(ownedPlaylist(id, currentUser.require()));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Dtos.PlaylistDto> create(@Valid @RequestBody Dtos.CreatePlaylistRequest req) {
        User user = currentUser.require();
        Playlist p = playlistRepository.save(new Playlist(user, req.name().trim()));
        // Optionally drop a video in right away (used by the "save" menu).
        if (req.videoId() != null) {
            videoRepository.findById(req.videoId())
                    .ifPresent(video -> itemRepository.save(new PlaylistItem(p, video)));
        }
        return ResponseEntity.status(CREATED).body(mapper.playlist(p, req.videoId()));
    }

    @PatchMapping("/{id}")
    @Transactional
    public Dtos.PlaylistDto rename(@PathVariable Long id, @Valid @RequestBody Dtos.UpdatePlaylistRequest req) {
        Playlist p = ownedPlaylist(id, currentUser.require());
        p.setName(req.name().trim());
        return mapper.playlist(playlistRepository.save(p), null);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Playlist p = ownedPlaylist(id, currentUser.require());
        itemRepository.deleteByPlaylistId(p.getId());
        playlistRepository.delete(p);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/videos/{videoId}")
    @Transactional
    public ResponseEntity<Void> addVideo(@PathVariable Long id, @PathVariable Long videoId) {
        Playlist p = ownedPlaylist(id, currentUser.require());
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        if (!itemRepository.existsByPlaylistIdAndVideoId(p.getId(), videoId)) {
            itemRepository.save(new PlaylistItem(p, video));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/videos/{videoId}")
    @Transactional
    public ResponseEntity<Void> removeVideo(@PathVariable Long id, @PathVariable Long videoId) {
        Playlist p = ownedPlaylist(id, currentUser.require());
        itemRepository.deleteByPlaylistIdAndVideoId(p.getId(), videoId);
        return ResponseEntity.noContent().build();
    }
}
