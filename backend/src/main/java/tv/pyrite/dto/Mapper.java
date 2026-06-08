package tv.pyrite.dto;

import org.springframework.stereotype.Component;
import tv.pyrite.comment.Comment;
import tv.pyrite.comment.CommentRepository;
import tv.pyrite.library.ListKind;
import tv.pyrite.library.VideoListEntryRepository;
import tv.pyrite.playlist.Playlist;
import tv.pyrite.playlist.PlaylistItem;
import tv.pyrite.playlist.PlaylistItemRepository;
import tv.pyrite.user.User;
import tv.pyrite.video.Video;
import tv.pyrite.video.VideoRepository;

@Component
public class Mapper {

    private final VideoRepository videoRepository;
    private final CommentRepository commentRepository;
    private final VideoListEntryRepository listRepository;
    private final PlaylistItemRepository playlistItemRepository;

    public Mapper(VideoRepository videoRepository, CommentRepository commentRepository,
                  VideoListEntryRepository listRepository, PlaylistItemRepository playlistItemRepository) {
        this.videoRepository = videoRepository;
        this.commentRepository = commentRepository;
        this.listRepository = listRepository;
        this.playlistItemRepository = playlistItemRepository;
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
        boolean savedByMe = currentUserId != null
                && listRepository.existsByUserIdAndVideoIdAndKind(currentUserId, v.getId(), ListKind.SAVED);
        boolean watchLaterByMe = currentUserId != null
                && listRepository.existsByUserIdAndVideoIdAndKind(currentUserId, v.getId(), ListKind.WATCH_LATER);
        boolean inPlaylist = currentUserId != null
                && playlistItemRepository.existsByPlaylistOwnerIdAndVideoId(currentUserId, v.getId());
        long commentCount = commentRepository.countByVideoId(v.getId());
        return new Dtos.VideoDetailDto(
                v.getId(), v.getTitle(), v.getDescription(), v.getHashtags(), v.getCategory(),
                v.getDurationSeconds(), v.getViews(), v.getLikedBy().size(), likedByMe,
                savedByMe, watchLaterByMe, inPlaylist,
                v.isFeatured(), mediaUrl(v.getVideoFile()), mediaUrl(v.getThumbnailFile()),
                commentCount, user(v.getUploader()), v.getCreatedAt());
    }

    public Dtos.PlaylistDto playlist(Playlist p, Long videoIdForMembership) {
        long count = playlistItemRepository.countByPlaylistId(p.getId());
        String coverUrl = playlistItemRepository.findFirstByPlaylistIdOrderByAddedAtDesc(p.getId())
                .map(item -> mediaUrl(item.getVideo().getThumbnailFile()))
                .orElse(null);
        Boolean contains = videoIdForMembership == null ? null
                : playlistItemRepository.existsByPlaylistIdAndVideoId(p.getId(), videoIdForMembership);
        return new Dtos.PlaylistDto(p.getId(), p.getName(), count, coverUrl, contains, p.getCreatedAt());
    }

    public Dtos.PlaylistDetailDto playlistDetail(Playlist p) {
        var videos = playlistItemRepository.findByPlaylistIdOrderByAddedAtDesc(p.getId())
                .stream().map(PlaylistItem::getVideo).map(this::videoSummary).toList();
        return new Dtos.PlaylistDetailDto(p.getId(), p.getName(), videos.size(), videos, p.getCreatedAt());
    }

    public Dtos.CommentDto comment(Comment c) {
        return new Dtos.CommentDto(
                c.getId(), c.getText(), c.getLikes(), user(c.getAuthor()), c.getCreatedAt());
    }
}
