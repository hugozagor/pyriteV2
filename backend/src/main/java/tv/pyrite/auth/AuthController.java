package tv.pyrite.auth;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.security.CurrentUser;
import tv.pyrite.security.JwtService;
import tv.pyrite.user.User;
import tv.pyrite.user.UserRepository;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final Mapper mapper;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService,
                          UserRepository userRepository, CurrentUser currentUser, Mapper mapper) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
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
}
