package tv.pyrite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

/** Container for the app's request/response records to keep things in one place. */
public final class Dtos {

    private Dtos() {}

    // ---- Auth ----
    public record LoginRequest(
            @NotBlank String login,
            @NotBlank String password) {}

    public record AuthResponse(String token, UserDto user) {}

    // ---- Users ----
    public record UserDto(
            Long id,
            String email,
            String username,
            String displayName,
            String role,
            String bio,
            String avatarColor,
            long videoCount,
            Instant createdAt) {}

    public record CreateUserRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 3, max = 30) String username,
            @NotBlank String displayName,
            @NotBlank @Size(min = 6) String password,
            String role,
            String bio) {}

    public record UpdateUserRequest(
            String displayName,
            String bio,
            String password,
            String role) {}

    // Self-service profile editing (the signed-in user updates their own account).
    public record UpdateProfileRequest(
            @NotBlank String displayName,
            @NotBlank @Email String email,
            String bio,
            String avatarColor) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6) String newPassword) {}

    // ---- Videos ----
    public record VideoSummaryDto(
            Long id,
            String title,
            String category,
            long durationSeconds,
            long views,
            boolean featured,
            String thumbnailUrl,
            UserDto uploader,
            Instant createdAt) {}

    public record VideoDetailDto(
            Long id,
            String title,
            String description,
            String hashtags,
            String category,
            long durationSeconds,
            long views,
            long likes,
            boolean likedByMe,
            long dislikes,
            boolean dislikedByMe,
            boolean savedByMe,
            boolean watchLaterByMe,
            boolean inPlaylist,
            boolean featured,
            String videoUrl,
            String thumbnailUrl,
            long commentCount,
            UserDto uploader,
            Instant createdAt) {}

    public record UpdateVideoRequest(
            String title,
            String description,
            String hashtags,
            String category,
            Boolean featured) {}

    // ---- Comments ----
    public record CreateCommentRequest(@NotBlank @Size(max = 2000) String text) {}

    public record CommentDto(
            Long id,
            String text,
            long likes,
            UserDto author,
            Instant createdAt) {}

    public record FeedDto(
            VideoDetailDto featured,
            List<VideoSummaryDto> videos) {}

    /** Lightweight search-as-you-type suggestion. */
    public record SuggestionDto(
            Long id,
            String title,
            String thumbnailUrl,
            String channel) {}

    // ---- Playlists ----
    public record PlaylistDto(
            Long id,
            String name,
            long videoCount,
            String coverUrl,
            Boolean containsVideo,
            Instant createdAt) {}

    public record PlaylistDetailDto(
            Long id,
            String name,
            long videoCount,
            List<VideoSummaryDto> videos,
            Instant createdAt) {}

    public record CreatePlaylistRequest(
            @NotBlank @Size(max = 120) String name,
            Long videoId) {}

    public record UpdatePlaylistRequest(@NotBlank @Size(max = 120) String name) {}
}
