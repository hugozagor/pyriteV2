package tv.pyrite.library;

import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

/** The two personal video lists a user can curate. */
public enum ListKind {
    WATCH_LATER,
    SAVED;

    /** Maps the URL slug (watch-later / saved) to the enum. */
    public static ListKind fromSlug(String slug) {
        if (slug == null) throw new ResponseStatusException(BAD_REQUEST, "Liste inconnue");
        return switch (slug.toLowerCase()) {
            case "watch-later", "watchlater" -> WATCH_LATER;
            case "saved" -> SAVED;
            default -> throw new ResponseStatusException(BAD_REQUEST, "Liste inconnue: " + slug);
        };
    }
}
