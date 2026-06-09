package tv.pyrite.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Exposes the uploaded media directory as static resources under /api/media/**.
 * Only active for local storage; in S3 mode the browser reads from presigned URLs.
 * Spring's ResourceHttpRequestHandler handles HTTP Range requests automatically,
 * giving the browser video player seek support.
 */
@Configuration
@ConditionalOnProperty(name = "pyrite.storage.type", havingValue = "local", matchIfMissing = true)
public class WebConfig implements WebMvcConfigurer {

    private final String storageLocation;

    public WebConfig(@Value("${pyrite.storage.location}") String storageLocation) {
        this.storageLocation = storageLocation;
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        String location = Paths.get(storageLocation).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/api/media/**")
                .addResourceLocations(location)
                .setCachePeriod(31536000);
    }
}
