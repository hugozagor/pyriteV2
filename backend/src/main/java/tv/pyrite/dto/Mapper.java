package tv.pyrite.dto;

import org.springframework.stereotype.Component;
import tv.pyrite.comment.Comment;
import tv.pyrite.comment.CommentRepository;
import tv.pyrite.user.User;
import tv.pyrite.video.Video;
import tv.pyrite.video.VideoRepository;

@Component
public class Mapper {

    private final VideoRepository videoRepository;
    private final CommentRepository commentRepository;

    public Mapper(VideoRepository videoRepository, CommentRepository commentRepository) {
        this.videoRepository = videoRepository;
        this.commentRepository = commentRepository;
    }

    private String mediaUrl(String filename) {
        return filename == null ? null : "/api/media/" + filename;
    }

    public Dtos.UserDto user(User u) {
        if (u == null) return null;
        long videoCount = videoRepository.findByUploaderIdOrderByCreatedAtDesc(u.getId()).size();
        return new Dtos.UserDto(
                u.getId(), u.getEmail(), u.getUsername(), u.getDisplayName(),
                u.getRole().name(), u.getBio(), u.getAvatarColor(), videoCount, u.getCreatedAt());
    }

    public Dtos.VideoSummaryDto videoSummary(Video v) {
        return new Dtos.VideoSummaryDto(
                v.getId(), v.getTitle(), v.getCategory(), v.getDurationSeconds(),
                v.getViews(), v.isFeatured(), mediaUrl(v.getThumbnailFile()),
                user(v.getUploader()), v.getCreatedAt());
    }

    public Dtos.VideoDetailDto videoDetail(Video v, Long currentUserId) {
        boolean likedByMe = currentUserId != null && v.getLikedBy().contains(currentUserId);
        long commentCount = commentRepository.countByVideoId(v.getId());
        return new Dtos.VideoDetailDto(
                v.getId(), v.getTitle(), v.getDescription(), v.getHashtags(), v.getCategory(),
                v.getDurationSeconds(), v.getViews(), v.getLikedBy().size(), likedByMe,
                v.isFeatured(), mediaUrl(v.getVideoFile()), mediaUrl(v.getThumbnailFile()),
                commentCount, user(v.getUploader()), v.getCreatedAt());
    }

    public Dtos.CommentDto comment(Comment c) {
        return new Dtos.CommentDto(
                c.getId(), c.getText(), c.getLikes(), user(c.getAuthor()), c.getCreatedAt());
    }
}
