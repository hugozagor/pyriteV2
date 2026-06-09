package tv.pyrite.auth;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.security.CurrentUser;
import tv.pyrite.security.JwtService;
import tv.pyrite.user.User;
import tv.pyrite.user.UserRepository;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          UserRepository userRepository, PasswordEncoder passwordEncoder,
                          CurrentUser currentUser, Mapper mapper) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUser = currentUser;
        this.mapper = mapper;
    }

    @PostMapping("/login")
    public Dtos.AuthResponse login(@Valid @RequestBody Dtos.LoginRequest request) {
        // Resolve username from either username or email so users can sign in with both.
        User user = userRepository.findByUsername(request.login())
                .or(() -> userRepository.findByEmail(request.login()))
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Identifiants invalides"));
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), request.password()));
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(UNAUTHORIZED, "Identifiants invalides");
        }
        String token = jwtService.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        return new Dtos.AuthResponse(token, mapper.user(user));
    }

    @GetMapping("/me")
    public ResponseEntity<Dtos.UserDto> me() {
        return currentUser.get()
                .map(u -> ResponseEntity.ok(mapper.user(u)))
                .orElseGet(() -> ResponseEntity.status(UNAUTHORIZED).build());
    }

    /** The signed-in user updates their own profile information. */
    @PatchMapping("/me")
    @Transactional
    public Dtos.UserDto updateProfile(@Valid @RequestBody Dtos.UpdateProfileRequest req) {
        User user = currentUser.require();

        String email = req.email().trim().toLowerCase();
        if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(CONFLICT, "Cet e-mail est déjà utilisé");
        }
        user.setDisplayName(req.displayName().trim());
        user.setEmail(email);
        user.setBio(req.bio());
        if (req.avatarColor() != null && !req.avatarColor().isBlank()) {
            user.setAvatarColor(req.avatarColor().trim());
        }
        return mapper.user(userRepository.save(user));
    }

    /** The signed-in user changes their own password (must confirm the current one). */
    @PutMapping("/me/password")
    @Transactional
    public ResponseEntity<Void> changePassword(@Valid @RequestBody Dtos.ChangePasswordRequest req) {
        User user = currentUser.require();
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(BAD_REQUEST, "Mot de passe actuel incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}
