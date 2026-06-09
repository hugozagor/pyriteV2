package tv.pyrite.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tv.pyrite.user.Role;
import tv.pyrite.user.User;
import tv.pyrite.user.UserRepository;
import tv.pyrite.video.VideoRepository;

/** Creates the default administrator account on first boot and backfills legacy data. */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VideoRepository videoRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminUsername;
    private final String adminPassword;
    private final String adminDisplayName;

    public DataInitializer(UserRepository userRepository, VideoRepository videoRepository,
                           PasswordEncoder passwordEncoder,
                           @Value("${pyrite.admin.email}") String adminEmail,
                           @Value("${pyrite.admin.username}") String adminUsername,
                           @Value("${pyrite.admin.password}") String adminPassword,
                           @Value("${pyrite.admin.display-name}") String adminDisplayName) {
        this.userRepository = userRepository;
        this.videoRepository = videoRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
        this.adminDisplayName = adminDisplayName;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Give legacy videos (uploaded before the language column existed) a default language.
        int updated = videoRepository.backfillNullLanguage();
        if (updated > 0) {
            log.info("Pyrite — langue par défaut (fr) appliquée à {} vidéo(s) existante(s)", updated);
        }

        if (userRepository.countByRole(Role.ADMIN) > 0) {
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail.toLowerCase());
        admin.setUsername(adminUsername);
        admin.setDisplayName(adminDisplayName);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        admin.setBio("Apnée, plongée libre et grand bleu. Chaque semaine, une immersion sans bruit pour explorer ce qui se cache sous la surface.");
        admin.setAvatarColor("#2BB3D6");
        userRepository.save(admin);

        log.info("==================================================");
        log.info(" Pyrite — compte administrateur créé");
        log.info("   identifiant : {}", adminUsername);
        log.info("   e-mail      : {}", adminEmail);
        log.info("   mot de passe: {}", adminPassword);
        log.info("==================================================");
    }
}
