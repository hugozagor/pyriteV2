package tv.pyrite.user;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tv.pyrite.comment.CommentRepository;
import tv.pyrite.library.VideoListEntryRepository;
import tv.pyrite.playlist.PlaylistItemRepository;
import tv.pyrite.playlist.PlaylistRepository;
import tv.pyrite.dto.Dtos;
import tv.pyrite.dto.Mapper;
import tv.pyrite.security.CurrentUser;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final VideoListEntryRepository listRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final PlaylistRepository playlistRepository;
    private final PasswordEncoder passwordEncoder;
    private final Mapper mapper;
    private final CurrentUser currentUser;

    public UserController(UserRepository userRepository, CommentRepository commentRepository,
                          VideoListEntryRepository listRepository, PlaylistItemRepository playlistItemRepository,
                          PlaylistRepository playlistRepository, PasswordEncoder passwordEncoder,
                          Mapper mapper, CurrentUser currentUser) {
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.listRepository = listRepository;
        this.playlistItemRepository = playlistItemRepository;
        this.playlistRepository = playlistRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.currentUser = currentUser;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Dtos.UserDto> list() {
        return userRepository.findAll().stream().map(mapper::user).toList();
    }

    /** Public profile for any authenticated user (used by the channel page). */
    @GetMapping("/{id}")
    public Dtos.UserDto getOne(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(mapper::user)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur introuvable"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Dtos.UserDto> create(@Valid @RequestBody Dtos.CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ResponseStatusException(CONFLICT, "Cet e-mail est déjà utilisé");
        }
        if (userRepository.existsByUsername(req.username())) {
            throw new ResponseStatusException(CONFLICT, "Ce nom d'utilisateur est déjà pris");
        }
        User user = new User();
        user.setEmail(req.email().trim().toLowerCase());
        user.setUsername(req.username().trim());
        user.setDisplayName(req.displayName().trim());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole("ADMIN".equalsIgnoreCase(req.role()) ? Role.ADMIN : Role.MEMBER);
        user.setBio(req.bio());
        User saved = userRepository.save(user);
        return ResponseEntity.status(CREATED).body(mapper.user(saved));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Dtos.UserDto update(@PathVariable Long id, @RequestBody Dtos.UpdateUserRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur introuvable"));
        if (req.displayName() != null && !req.displayName().isBlank()) {
            user.setDisplayName(req.displayName().trim());
        }
        if (req.bio() != null) {
            user.setBio(req.bio());
        }
        if (req.password() != null && !req.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        if (req.role() != null && !req.role().isBlank()) {
            user.setRole("ADMIN".equalsIgnoreCase(req.role()) ? Role.ADMIN : Role.MEMBER);
        }
        return mapper.user(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Utilisateur introuvable"));
        if (currentUser.require().getId().equals(target.getId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Vous ne pouvez pas supprimer votre propre compte");
        }
        if (target.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ResponseStatusException(BAD_REQUEST, "Impossible de supprimer le dernier administrateur");
        }
        commentRepository.deleteByAuthorId(target.getId());
        listRepository.deleteByUserId(target.getId());
        playlistItemRepository.deleteByPlaylistOwnerId(target.getId());
        playlistRepository.deleteByOwnerId(target.getId());
        userRepository.delete(target);
        return ResponseEntity.noContent().build();
    }
}
