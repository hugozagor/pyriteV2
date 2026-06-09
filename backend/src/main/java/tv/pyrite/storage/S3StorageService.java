package tv.pyrite.storage;

import jakarta.annotation.PreDestroy;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.Duration;
import java.util.UUID;

/**
 * Stores media in an Amazon S3 bucket. Uploads are proxied through the backend;
 * reads are served by short-lived presigned URLs so the browser streams the
 * video directly from S3 (offloading bandwidth and keeping HTTP Range support).
 */
@Service
@ConditionalOnProperty(name = "pyrite.storage.type", havingValue = "s3")
public class S3StorageService implements StorageService {

    private final S3Client s3;
    private final S3Presigner presigner;
    private final String bucket;
    private final Duration presignTtl;

    public S3StorageService(
            @Value("${pyrite.s3.bucket}") String bucket,
            @Value("${pyrite.s3.region}") String region,
            @Value("${pyrite.s3.access-key:}") String accessKey,
            @Value("${pyrite.s3.secret-key:}") String secretKey,
            @Value("${pyrite.s3.presign-minutes:360}") long presignMinutes) {

        this.bucket = bucket;
        this.presignTtl = Duration.ofMinutes(presignMinutes);
        Region awsRegion = Region.of(region);

        // Explicit keys if provided, otherwise the default chain (env vars, IAM role…).
        var credentials = (accessKey != null && !accessKey.isBlank())
                ? StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey))
                : DefaultCredentialsProvider.create();

        this.s3 = S3Client.builder().region(awsRegion).credentialsProvider(credentials).build();
        this.presigner = S3Presigner.builder().region(awsRegion).credentialsProvider(credentials).build();
    }

    @Override
    public String store(MultipartFile file, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String key = prefix + "-" + UUID.randomUUID() + LocalStorageService.extension(file.getOriginalFilename());
        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();
        try {
            s3.putObject(put, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to upload to S3", e);
        }
        return key;
    }

    @Override
    public void delete(String key) {
        if (key == null || key.isBlank()) return;
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }

    @Override
    public String url(String key) {
        if (key == null) return null;
        GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(key).build();
        GetObjectPresignRequest presign = GetObjectPresignRequest.builder()
                .signatureDuration(presignTtl)
                .getObjectRequest(get)
                .build();
        return presigner.presignGetObject(presign).url().toString();
    }

    @PreDestroy
    public void close() {
        s3.close();
        presigner.close();
    }
}
