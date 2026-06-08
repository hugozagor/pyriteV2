package tv.pyrite.comment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByVideoIdOrderByCreatedAtDesc(Long videoId);
    long countByVideoId(Long videoId);
    void deleteByAuthorId(Long authorId);
    void deleteByVideoId(Long videoId);
}
