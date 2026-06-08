package tv.pyrite.comment;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.security.CurrentUser;
import tv.pyrite.user.Role;
import tv.pyrite.user.User;
import tv.pyrite.video.Video;
import tv.pyrite.video.VideoRepository;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/videos/{videoId}/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final VideoRepository videoRepository;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public CommentController(CommentRepository commentRepository, VideoRepository videoRepository,
                             CurrentUser currentUser, Mapper mapper) {
        this.commentRepository = commentRepository;
        this.videoRepository = videoRepository;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    @GetMapping
    public List<Dtos.CommentDto> list(@PathVariable Long videoId) {
        return commentRepository.findByVideoIdOrderByCreatedAtDesc(videoId)
                .stream().map(mapper::comment).toList();
    }

    @PostMapping
    public ResponseEntity<Dtos.CommentDto> create(@PathVariable Long videoId,
                                                  @Valid @RequestBody Dtos.CreateCommentRequest req) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Vidéo introuvable"));
        User author = currentUser.require();
        Comment comment = new Comment();
        comment.setVideo(video);
        comment.setAuthor(author);
        comment.setText(req.text().trim());
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(CREATED).body(mapper.comment(saved));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long videoId, @PathVariable Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Commentaire introuvable"));
        User user = currentUser.require();
        boolean isOwner = comment.getAuthor().getId().equals(user.getId());
        if (!isOwner && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "Action non autorisée");
        }
        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}
