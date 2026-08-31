# Path and scope normalization

V2 canonicalizes relative POSIX paths, removes equivalent trailing separators, rejects absolute paths and traversal, deduplicates, and checks directory containment with a separator. `foo` cannot authorize `foobar`; traversal and symlink-like lexical escapes are rejected before comparison.
