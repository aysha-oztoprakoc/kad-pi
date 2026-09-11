//! Integration tests for the Gaya world loader, rules engine, spatial
//! navigation and the MoBA-inspired in-game context buffer.
//!
//! The loader tests exercise the *sealed* G1 release corpus
//! (`evidence/WP-GAYA-DATASET-G1/09-release/`); the rule and buffer tests are
//! pure and deterministic.

use std::path::{Path, PathBuf};

use stack_core::gaya_world::{
    Currency, GayaWorld, MoBABlockContextBuffer, SYNTHESIS_LIVING_VIOLATION, calculate_damage,
    convert_currency, validate_synthesis,
};

/// Resolve the sealed G1 release directory relative to this crate.
fn sealed_release_dir() -> PathBuf {
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let dir = manifest_dir.join("../../../evidence/WP-GAYA-DATASET-G1/09-release");
    dir.canonicalize()
        .unwrap_or_else(|e| panic!("cannot resolve sealed release dir {dir:?}: {e}"))
}

fn load_world() -> GayaWorld {
    GayaWorld::load_from_release_dir(&sealed_release_dir()).expect("load sealed G1 release")
}

fn world_json_text(dir: &Path) -> String {
    std::fs::read_to_string(dir.join("game/world.json")).expect("read world.json")
}

fn assets_jsonl_text(dir: &Path) -> String {
    std::fs::read_to_string(dir.join("game/assets.jsonl")).expect("read assets.jsonl")
}

// ---------------------------------------------------------------------------
// Loading the sealed release
// ---------------------------------------------------------------------------

#[test]
fn loads_full_sealed_release_from_release_dir() {
    let world = load_world();
    assert_eq!(world.schema_version, "1.0.0");
    assert_eq!(world.release_id, "gaya_game_world_v1");
    assert_eq!(world.entities.len(), 53);
    assert_eq!(world.spatial_nodes.len(), 16);
    assert_eq!(world.spatial_edges.len(), 13);
    assert_eq!(world.assets.len(), 151);
}

#[test]
fn from_json_parses_entities_spatial_graph_and_assets() {
    let dir = sealed_release_dir();
    let world = GayaWorld::from_json(&world_json_text(&dir), &assets_jsonl_text(&dir))
        .expect("parse from_json");

    // Known canonical entities resolve by slug (locations are entities of
    // category "locations" and also spatial nodes).
    let refugio = world.entity("refugio_ykt").expect("refugio entity present");
    assert_eq!(refugio.category, "locations");
    let crosta = world
        .entity("crosta_de_kravarius")
        .expect("crosta entity present");
    assert_eq!(crosta.category, "mechanics");
    assert!(!crosta.name.is_empty());
    let aysha = world
        .entity("aysha_oztoprak")
        .expect("aysha entity present");
    assert_eq!(aysha.category, "characters");

    // Spatial graph mirrored from the nested `spatial_graph` object.
    assert!(world.spatial_node("savana_negra").is_some());
    assert!(world.spatial_node("templo_suspenso").is_some());
    let edge = world
        .spatial_edges
        .iter()
        .find(|e| e.parent == "refugio_ykt" && e.child == "heartwood")
        .expect("refugio_ykt contains heartwood edge");
    assert_eq!(edge.relation, "contains");

    // Every asset line parsed; pixel dimensions may legitimately be absent.
    let with_dims = world
        .assets
        .iter()
        .filter(|a| a.pixel_dimensions.is_some())
        .count();
    assert_eq!(with_dims, world.assets.len() - 4);
    let first = &world.assets[0];
    assert!(!first.sha256.is_empty());
    assert!(first.is_historical_reference);
}

#[test]
fn malformed_json_returns_err_not_panic() {
    let dir = sealed_release_dir();
    assert!(GayaWorld::from_json("{not json", "").is_err());
    assert!(GayaWorld::from_json(&world_json_text(&dir), "not-json-line").is_err());
}

// ---------------------------------------------------------------------------
// Combat damage calculation (Kravarius Crust RD 2, True Damage bypass)
// ---------------------------------------------------------------------------

#[test]
fn combat_rd2_reduces_standard_damage() {
    // 12 standard incoming with the Crosta => 12 - 2 = 10.
    assert_eq!(calculate_damage(12, 0, true), 10);
    // Without the crust there is no reduction.
    assert_eq!(calculate_damage(12, 0, false), 12);
}

#[test]
fn combat_rd2_never_goes_below_zero() {
    assert_eq!(calculate_damage(1, 0, true), 0);
    assert_eq!(calculate_damage(0, 0, true), 0);
}

#[test]
fn combat_true_damage_ignores_reduction() {
    // True damage portion is added without ever being reduced by RD.
    assert_eq!(calculate_damage(10, 5, true), 13); // (10-2) + 5
    assert_eq!(calculate_damage(10, 5, false), 15);
    assert_eq!(calculate_damage(0, 20, true), 20);
}

// ---------------------------------------------------------------------------
// Synthesis rule validation
// ---------------------------------------------------------------------------

#[test]
fn synthesis_rule_rejects_living_tissue() {
    let err = validate_synthesis(true).expect_err("living tissue must violate synthesis rule");
    assert_eq!(err, SYNTHESIS_LIVING_VIOLATION);
}

#[test]
fn synthesis_rule_accepts_inert_material() {
    assert_eq!(validate_synthesis(false), Ok(()));
}

// ---------------------------------------------------------------------------
// Currency conversion (1 Yorman = 100 Khan)
// ---------------------------------------------------------------------------

#[test]
fn currency_yorman_to_khan_scales_by_100() {
    assert_eq!(convert_currency(1, Currency::Yorman, Currency::Khan), 100);
    assert_eq!(convert_currency(2, Currency::Yorman, Currency::Khan), 200);
    assert_eq!(convert_currency(0, Currency::Yorman, Currency::Khan), 0);
}

#[test]
fn currency_khan_to_yorman_truncates_nonwhole() {
    assert_eq!(convert_currency(100, Currency::Khan, Currency::Yorman), 1);
    assert_eq!(convert_currency(250, Currency::Khan, Currency::Yorman), 2);
    assert_eq!(convert_currency(50, Currency::Khan, Currency::Yorman), 0);
}

#[test]
fn currency_same_kind_is_identity() {
    assert_eq!(convert_currency(1000, Currency::Khan, Currency::Khan), 1000);
    assert_eq!(convert_currency(7, Currency::Yorman, Currency::Yorman), 7);
}

// ---------------------------------------------------------------------------
// Spatial pathfinding (sealed release graph)
// ---------------------------------------------------------------------------

#[test]
fn spatial_route_refugio_ykt_to_templo_suspenso() {
    let world = load_world();
    let route = world
        .find_route("refugio_ykt", "templo_suspenso")
        .expect("a route exists");
    assert_eq!(route, vec!["refugio_ykt", "templo_suspenso"]);
}

#[test]
fn spatial_route_refugio_ykt_to_savana_negra_is_none() {
    // In the *released* spatial graph Refúgio YKT and Savana Negra belong to
    // two disconnected components (the Refúgio tree and the
    // savana/floresta pair), so no deterministic route exists.
    let world = load_world();
    assert_eq!(world.find_route("refugio_ykt", "savana_negra"), None);
}

#[test]
fn spatial_route_within_savana_component_is_found() {
    let world = load_world();
    let route = world
        .find_route("savana_negra", "floresta_negra")
        .expect("savana connects to floresta");
    assert_eq!(route, vec!["savana_negra", "floresta_negra"]);
}

#[test]
fn spatial_route_round_trip_and_between_rooms() {
    let world = load_world();
    // A contained room routes through its anchor.
    assert_eq!(
        world.find_route("refugio_ykt", "heartwood"),
        Some(vec!["refugio_ykt".to_string(), "heartwood".to_string()])
    );
    // Routes are symmetric on the undirected graph.
    assert_eq!(
        world.find_route("heartwood", "refugio_ykt"),
        Some(vec!["heartwood".to_string(), "refugio_ykt".to_string()])
    );
    // Same node is a trivial one-stop route.
    assert_eq!(
        world.find_route("refugio_ykt", "refugio_ykt"),
        Some(vec!["refugio_ykt".to_string()])
    );
    // Unknown slugs yield no route.
    assert_eq!(world.find_route("refugio_ykt", "does-not-exist"), None);
}

// ---------------------------------------------------------------------------
// MoBA block context buffer: scoring and top-k selection
// ---------------------------------------------------------------------------

/// ids() helper returning stored block ids in order.
fn ids(result: &[&stack_core::gaya_world::ContextBlock]) -> Vec<usize> {
    result.iter().map(|b| b.id).collect()
}

#[test]
fn moba_always_keeps_current_block_independent_of_top_k() {
    let mut buffer = MoBABlockContextBuffer::new(8);
    buffer.add("savana_negra", vec![], "past silence");
    buffer.add(
        "templo_suspenso",
        vec!["aysha_oztoprak".into()],
        "old temple event",
    );
    let current = buffer.add("refugio_ykt", vec![], "current dialogue in Refúgio");

    // top_k = 0 still returns the current block located at the query node.
    let result = buffer.query_relevant_blocks("refugio_ykt", &[], 0);
    assert_eq!(ids(&result), vec![current]);
    // The current block is the *newest* block anchored at refugio_ykt and is
    // placed first.
    let current_id = buffer
        .blocks()
        .iter()
        .filter(|b| b.spatial_node == "refugio_ykt")
        .map(|b| b.id)
        .max()
        .unwrap();
    assert_eq!(current_id, current);
}

#[test]
fn moba_entity_overlap_outranks_no_overlap_deterministically() {
    let mut buffer = MoBABlockContextBuffer::new(8);
    buffer.add(
        "savana_negra",
        vec!["aysha_oztoprak".into()],
        "solo mention",
    );
    buffer.add("templo_suspenso", vec!["douglas".into()], "unrelated");
    buffer.add(
        "floresta_negra",
        vec!["aysha_oztoprak".into(), "amethysta".into()],
        "dual mention",
    );

    // Query node has no block: no current block, purely top-k by relevance.
    let active = ["aysha_oztoprak", "amethysta"];
    let result = buffer.query_relevant_blocks("heartwood", &active, 2);
    assert_eq!(ids(&result), vec![2, 0]); // dual (score 2) then solo (score 1); unrelated excluded
}

#[test]
fn moba_spatial_locality_outranks_distant_entity_overlap() {
    let mut buffer = MoBABlockContextBuffer::new(8);
    buffer.add("refugio_ykt", vec![], "older local event"); // id 0
    buffer.add(
        "savana_negra",
        vec![
            "aysha_oztoprak".into(),
            "amethysta".into(),
            "douglas".into(),
        ],
        "distant triple mention",
    ); // id 1
    buffer.add("refugio_ykt", vec![], "newest local dialogue"); // id 2 -> current

    let active = ["aysha_oztoprak", "amethysta", "douglas"];
    let result = buffer.query_relevant_blocks("refugio_ykt", &active, 1);
    // Current block (id 2) first, then the older local block (id 0) — its
    // locality outranks the distant high-entity-overlap block (id 1).
    assert_eq!(ids(&result), vec![2, 0]);
}

#[test]
fn moba_top_k_is_respected_after_current_block() {
    let mut buffer = MoBABlockContextBuffer::new(16);
    // One current block at refugio_ykt.
    let current = buffer.add("refugio_ykt", vec!["aysha_oztoprak".into()], "now");
    // Add several unrelated past blocks.
    for i in 0..10 {
        buffer.add(
            "savana_negra",
            vec!["entity_".to_string() + &i.to_string()],
            format!("past {i}"),
        );
    }
    let result = buffer.query_relevant_blocks("refugio_ykt", &["aysha_oztoprak"], 3);
    // Exactly 1 (current) + 3 past blocks, current block first.
    assert_eq!(result.len(), 4);
    assert_eq!(result[0].id, current);
}

#[test]
fn moba_buffer_is_bounded_and_evicts_oldest() {
    let mut buffer = MoBABlockContextBuffer::new(3);
    let first = buffer.add("refugio_ykt", vec![], "0");
    buffer.add("templo_suspenso", vec![], "1");
    buffer.add("savana_negra", vec![], "2");
    assert_eq!(buffer.len(), 3);

    // Fourth insertion evicts the oldest block (the one we added first).
    buffer.add("heartwood", vec![], "3");
    assert_eq!(buffer.len(), 3);
    assert!(!buffer.blocks().iter().any(|b| b.id == first));
    // Ids remain unique and monotonic.
    let ids: Vec<usize> = buffer.blocks().iter().map(|b| b.id).collect();
    assert_eq!(ids, vec![1, 2, 3]);
}
