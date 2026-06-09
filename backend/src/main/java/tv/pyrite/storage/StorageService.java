package tv.pyrite.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction over where uploaded media lives. Two implementations are wired by
 * the {@code pyrite.storage.type} property: {@code local} (default, on disk) and
 * {@code s3} (Amazon S3 with presigned read URLs).
 */
public interface StorageService {

    /** Stores a file and returns its storage key (used as the DB reference). */
    String store(MultipartFile file, String prefix);

    /** Removes a stored file; no-op if the key is null/blank or already gone. */
    void delete(String key);

    /** A URL the browser can use to read the file (local path or presigned S3 URL). */
    String url(String key);
}
