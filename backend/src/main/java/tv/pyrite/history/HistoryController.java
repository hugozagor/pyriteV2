package tv.pyrite.history;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.security.CurrentUser;
import tv.pyrite.user.User;

import java.util.List;

/** The signed-in user's watch history. */
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final WatchHistoryRepository historyRepository;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public HistoryController(WatchHistoryRepository historyRepository, CurrentUser currentUser, Mapper mapper) {
        this.historyRepository = historyRepository;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Dtos.VideoSummaryDto> list() {
        User user = currentUser.require();
        return historyRepository.findByUserIdOrderByWatchedAtDesc(user.getId())
                .stream().map(e -> mapper.videoSummary(e.getVideo())).toList();
    }

    @DeleteMapping("/{videoId}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable Long videoId) {
        historyRepository.deleteByUserIdAndVideoId(currentUser.require().getId(), videoId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> clear() {
        historyRepository.deleteByUserId(currentUser.require().getId());
        return ResponseEntity.noContent().build();
    }
}
