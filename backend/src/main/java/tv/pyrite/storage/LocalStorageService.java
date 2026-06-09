package tv.pyrite.storage;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/** Stores media on the local disk and serves it via the /api/media/** handler. */
@Service
@ConditionalOnProperty(name = "pyrite.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final Path root;

    public LocalStorageService(@Value("${pyrite.storage.location}") String location) {
        this.root = Paths.get(location).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create storage directory", e);
        }
    }

    @Override
    public String store(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String filename = prefix + "-" + UUID.randomUUID() + extension(file.getOriginalFilename());
        Path target = resolve(filename);
        try {
            Files.copy(file.getInputStream(), target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file", e);
        }
        return filename;
    }

    @Override
    public void delete(String key) {
        if (key == null || key.isBlank()) return;
        try {
            Files.deleteIfExists(resolve(key));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to delete file", e);
        }
    }

    @Override
    public String url(String key) {
        return key == null ? null : "/api/media/" + key;
    }

    private Path resolve(String filename) {
        Path target = root.resolve(filename).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Invalid path");
        }
        return target;
    }

    static String extension(String original) {
        if (original == null) return "";
        int dot = original.lastIndexOf('.');
        return dot >= 0 ? original.substring(dot).toLowerCase() : "";
    }
}
