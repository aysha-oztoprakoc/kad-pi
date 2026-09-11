//! Deterministic loader and rules for the sealed Gaya G1 world dataset
//! (`evidence/WP-GAYA-DATASET-G1/09-release/`).
//!
//! Everything in this module is a pure, deterministic read of the release
//! corpus — it never mutates the sealed evidence. Mechanics are hard-coded
//! from the dataset's `supported_rules` so the game engine enforces canon:
//!
//! * `RULE_COMBAT_001` — Crosta de Kravarius grants RD 2; True Damage ignores RD.
//! * `RULE_ECONOMY_001` — conservation of currency, `1_Yorman_in_Khan = 100`.
//! * `RULE_SYNTHESIS_001` — extraction of synthesis threads from living
//!   beings is a canonical `VIOLATION`.
//!
//! The in-game context buffer is a MoBA-inspired (arXiv:2502.13189)
//! parameter-less block gating used for localized dialogue/event queries.

use std::collections::{HashMap, VecDeque};
use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

/// Damage reduction granted by the Crosta de Kravarius (`RULE_COMBAT_001`).
pub const KRAVARIUS_CRUST_RD: u32 = 2;

/// Khan value of a single Yorman (`RULE_ECONOMY_001`, `1_Yorman_in_Khan`).
pub const YORMAN_TO_KHAN_RATE: u32 = 100;

/// Canonical verdict for extracting synthesis threads from a living being
/// (`RULE_SYNTHESIS_001`).
pub const SYNTHESIS_LIVING_VIOLATION: &str =
    "VIOLATION: Extraction of synthesis threads from living beings is strictly prohibited";

// ---------------------------------------------------------------------------
// Data structures (Serde)
// ---------------------------------------------------------------------------

/// An entity of the Gaya world (character, item, faction, location, …).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct Entity {
    pub entity_id: String,
    pub slug: String,
    pub name: String,
    #[serde(default)]
    pub category: String,
    #[serde(default)]
    pub aliases: Vec<String>,
    #[serde(default)]
    pub description: String,
}

/// A spatial location (region, room, base, …) in the spatial containment graph.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpatialNode {
    pub slug: String,
    pub title: String,
    pub kind: String,
    #[serde(default)]
    pub notes: String,
}

/// An undirected spatial relation between two nodes (contains, adjacent_to,
/// floating_above, travel_route, …).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct SpatialEdge {
    pub relation: String,
    pub parent: String,
    pub child: String,
    #[serde(default)]
    pub evidence: String,
}

/// A media asset reference resolved from `assets.jsonl`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct MediaAssetReference {
    pub file_name: String,
    pub relative_path: String,
    pub file_exists: bool,
    pub sha256: String,
    pub visual_category: String,
    pub pixel_dimensions: Option<Vec<u32>>,
    #[serde(default)]
    pub associated_entities: Vec<String>,
    pub is_historical_reference: bool,
    pub canon_status: String,
}

/// Root object of the sealed world dataset, assembled from `game/world.json`
/// plus the asset records in `game/assets.jsonl`.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct GayaWorld {
    pub schema_version: String,
    pub release_id: String,
    pub entities: Vec<Entity>,
    pub spatial_nodes: Vec<SpatialNode>,
    pub spatial_edges: Vec<SpatialEdge>,
    pub assets: Vec<MediaAssetReference>,
}

/// Mirrors the raw `world.json` object (unknown fields are ignored).
#[derive(Debug, Deserialize)]
struct WorldDocument {
    #[serde(default)]
    schema_version: String,
    #[serde(default)]
    release_id: String,
    #[serde(default)]
    entities: Vec<Entity>,
    #[serde(default)]
    spatial_graph: SpatialGraphDocument,
}

#[derive(Debug, Default, Deserialize)]
struct SpatialGraphDocument {
    #[serde(default)]
    nodes: Vec<SpatialNode>,
    #[serde(default)]
    edges: Vec<SpatialEdge>,
}

impl GayaWorld {
    /// Build a world from the raw JSON text of `world.json` and the JSONL text
    /// of `assets.jsonl`.
    pub fn from_json(world_json_str: &str, assets_jsonl_str: &str) -> Result<Self, String> {
        let doc: WorldDocument = serde_json::from_str(world_json_str)
            .map_err(|e| format!("failed to parse world.json: {e}"))?;
        let assets = parse_assets_jsonl(assets_jsonl_str)?;
        Ok(GayaWorld {
            schema_version: doc.schema_version,
            release_id: doc.release_id,
            entities: doc.entities,
            spatial_nodes: doc.spatial_graph.nodes,
            spatial_edges: doc.spatial_graph.edges,
            assets,
        })
    }

    /// Load the world from a sealed release directory containing
    /// `game/world.json` and `game/assets.jsonl`.
    pub fn load_from_release_dir(dir: &Path) -> Result<Self, String> {
        let game_dir = dir.join("game");
        let world_path = game_dir.join("world.json");
        let assets_path = game_dir.join("assets.jsonl");
        let world_json = fs::read_to_string(&world_path)
            .map_err(|e| format!("cannot read {}: {e}", world_path.display()))?;
        let assets_jsonl = fs::read_to_string(&assets_path)
            .map_err(|e| format!("cannot read {}: {e}", assets_path.display()))?;
        Self::from_json(&world_json, &assets_jsonl)
    }

    /// Deterministic breadth-first route between two spatial nodes through the
    /// spatial edges (treated as undirected). Returns the shortest slug path,
    /// or `None` when the nodes are in disconnected components.
    pub fn find_route(&self, from_slug: &str, to_slug: &str) -> Option<Vec<String>> {
        if from_slug == to_slug {
            return Some(vec![from_slug.to_string()]);
        }
        // Build an undirected adjacency map. Neighbors are visited in sorted
        // (deterministic) order because the map values are BTreeSets.
        let mut adjacency: HashMap<&str, std::collections::BTreeSet<&str>> = HashMap::new();
        for edge in &self.spatial_edges {
            adjacency
                .entry(edge.parent.as_str())
                .or_default()
                .insert(edge.child.as_str());
            adjacency
                .entry(edge.child.as_str())
                .or_default()
                .insert(edge.parent.as_str());
        }
        if !adjacency.contains_key(from_slug) || !adjacency.contains_key(to_slug) {
            return None;
        }

        let mut predecessor: HashMap<String, String> = HashMap::new();
        let mut queue: VecDeque<&str> = VecDeque::new();
        queue.push_back(from_slug);
        predecessor.insert(from_slug.to_string(), String::new());

        while let Some(current) = queue.pop_front() {
            if current == to_slug {
                break;
            }
            if let Some(neighbors) = adjacency.get(current) {
                for &next in neighbors {
                    let next_owned = next.to_string();
                    match predecessor.entry(next_owned) {
                        std::collections::hash_map::Entry::Occupied(_) => {}
                        std::collections::hash_map::Entry::Vacant(slot) => {
                            slot.insert(current.to_string());
                            queue.push_back(next);
                        }
                    }
                }
            }
        }

        if !predecessor.contains_key(to_slug) {
            return None;
        }
        let mut path = vec![to_slug.to_string()];
        let mut cursor = to_slug.to_string();
        while let Some(prev) = predecessor.get(&cursor) {
            if prev.is_empty() {
                break;
            }
            cursor = prev.clone();
            path.push(cursor.clone());
        }
        path.reverse();
        Some(path)
    }

    /// Look up an entity by its canonical slug.
    pub fn entity(&self, slug: &str) -> Option<&Entity> {
        self.entities.iter().find(|e| e.slug == slug)
    }

    /// Look up a spatial node by its slug.
    pub fn spatial_node(&self, slug: &str) -> Option<&SpatialNode> {
        self.spatial_nodes.iter().find(|n| n.slug == slug)
    }
}

fn parse_assets_jsonl(assets_jsonl_str: &str) -> Result<Vec<MediaAssetReference>, String> {
    let mut assets = Vec::new();
    for (index, raw_line) in assets_jsonl_str.lines().enumerate() {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }
        let asset: MediaAssetReference = serde_json::from_str(line)
            .map_err(|e| format!("failed to parse assets.jsonl line {}: {e}", index + 1))?;
        assets.push(asset);
    }
    Ok(assets)
}

// ---------------------------------------------------------------------------
// Verified combat & mechanics rules
// ---------------------------------------------------------------------------

/// Compute damage dealt applying RD 2 from the Crosta de Kravarius to standard
/// `incoming` damage (never below 0). `true_damage` bypasses reduction.
pub fn calculate_damage(incoming: u32, true_damage: u32, has_kravarius_crust: bool) -> u32 {
    let reduction = if has_kravarius_crust {
        KRAVARIUS_CRUST_RD
    } else {
        0
    };
    let standard = incoming.saturating_sub(reduction);
    standard.saturating_add(true_damage)
}

/// Convert `amount` between the Khan and Yorman currencies (1 Yorman = 100
/// Khan). Same-currency conversions are the identity; Khan→Yorman truncates
/// any non-whole remainder that cannot form a full Yorman.
pub fn convert_currency(amount: u32, from: Currency, to: Currency) -> u32 {
    match (from, to) {
        (Currency::Khan, Currency::Khan) | (Currency::Yorman, Currency::Yorman) => amount,
        (Currency::Yorman, Currency::Khan) => amount.saturating_mul(YORMAN_TO_KHAN_RATE),
        (Currency::Khan, Currency::Yorman) => amount / YORMAN_TO_KHAN_RATE,
    }
}

/// Validate that a synthesis target is not living tissue
/// (`RULE_SYNTHESIS_001`).
pub fn validate_synthesis(is_living_tissue: bool) -> Result<(), String> {
    if is_living_tissue {
        Err(SYNTHESIS_LIVING_VIOLATION.to_string())
    } else {
        Ok(())
    }
}

/// The two circulating currencies of Gaya (`RULE_ECONOMY_001`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Currency {
    Khan,
    Yorman,
}

// ---------------------------------------------------------------------------
// MoBA-inspired in-game context buffer
// ---------------------------------------------------------------------------

/// Default maximum number of blocks retained by a [`MoBABlockContextBuffer`].
pub const DEFAULT_BLOCK_CAPACITY: usize = 256;

/// Locality bonus weight for a block located at the queried spatial node.
///
/// Locality dominates the parameter-less gate (matching the "localized"
/// queries this buffer serves); entity overlap refines within and across
/// localities. The value is only a relative ordering constant, never a learned
/// parameter.
const SPATIAL_LOCALITY_WEIGHT: i64 = 10_000;

/// One fixed-size context block: an event/dialogue anchored to a spatial node
/// and the entities involved (MoBA-style block of context).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct ContextBlock {
    pub id: usize,
    pub spatial_node: String,
    pub entities: Vec<String>,
    pub text: String,
}

/// A bounded, MoBA-inspired buffer of in-game dialogue/event blocks.
///
/// It is a ring of [`ContextBlock`]s (oldest evicted once capacity is
/// exceeded). Relevance selection is parameter-less: blocks are gated by
/// spatial-node locality plus exact entity overlap with the active set, and the
/// query's current block is always retained — mirroring the always-selected
/// current block of MoBA gating.
pub struct MoBABlockContextBuffer {
    blocks: Vec<ContextBlock>,
    capacity: usize,
    next_id: usize,
}

impl Default for MoBABlockContextBuffer {
    fn default() -> Self {
        Self::new(DEFAULT_BLOCK_CAPACITY)
    }
}

impl MoBABlockContextBuffer {
    /// Create an empty buffer that retains at most `capacity` blocks
    /// (`capacity` must be greater than zero).
    pub fn new(capacity: usize) -> Self {
        assert!(capacity > 0, "MoBABlockContextBuffer capacity must be > 0");
        MoBABlockContextBuffer {
            blocks: Vec::new(),
            capacity,
            next_id: 0,
        }
    }

    /// Number of blocks currently stored.
    pub fn len(&self) -> usize {
        self.blocks.len()
    }

    /// Whether the buffer is empty.
    pub fn is_empty(&self) -> bool {
        self.blocks.is_empty()
    }

    /// Append a new context block (assigned the next monotonically increasing
    /// id). The oldest block is evicted when the buffer exceeds its capacity.
    /// Returns the assigned block id.
    pub fn add<N: Into<String>, T: Into<String>>(
        &mut self,
        spatial_node: N,
        entities: Vec<String>,
        text: T,
    ) -> usize {
        let id = self.next_id;
        self.next_id += 1;
        self.blocks.push(ContextBlock {
            id,
            spatial_node: spatial_node.into(),
            entities,
            text: text.into(),
        });
        if self.blocks.len() > self.capacity {
            // Ids are assigned monotonically, so the oldest block is blocks[0].
            self.blocks.remove(0);
        }
        id
    }

    /// Immutable access to every stored block, oldest first.
    pub fn blocks(&self) -> &[ContextBlock] {
        &self.blocks
    }

    /// Remove all blocks but keep the configured capacity.
    pub fn clear(&mut self) {
        self.blocks.clear();
    }

    /// Query the most relevant blocks for the current play context.
    ///
    /// Parameter-less gating: a block's relevance is its locality (same
    /// `current_node`) plus the count of `active_entities` present in its
    /// entity list. The current block — the most recent block located at
    /// `current_node` — is always retained first, independent of `top_k`. Past
    /// blocks are then selected in relevance order (ties broken by ascending
    /// id) up to `top_k`. When no block exists at `current_node`, there is no
    /// "current" block and only the top `top_k` blocks are returned.
    pub fn query_relevant_blocks(
        &self,
        current_node: &str,
        active_entities: &[&str],
        top_k: usize,
    ) -> Vec<&ContextBlock> {
        // The current block is the newest block anchored at the query node.
        let current_id = self
            .blocks
            .iter()
            .filter(|b| b.spatial_node == current_node)
            .map(|b| b.id)
            .max();

        let active: std::collections::HashSet<&str> = active_entities.iter().copied().collect();
        let relevance = |block: &ContextBlock| -> i64 {
            let mut score = if block.spatial_node == current_node {
                SPATIAL_LOCALITY_WEIGHT
            } else {
                0
            };
            for entity in &block.entities {
                if active.contains(entity.as_str()) {
                    score += 1;
                }
            }
            score
        };

        let mut candidates: Vec<&ContextBlock> = self
            .blocks
            .iter()
            .filter(|b| Some(b.id) != current_id)
            .collect();
        candidates.sort_by(|a, b| {
            // Relevance descending, then ascending id for deterministic ties.
            relevance(b)
                .cmp(&relevance(a))
                .then_with(|| a.id.cmp(&b.id))
        });

        let mut result = Vec::new();
        if let Some(id) = current_id
            && let Some(current) = self.blocks.iter().find(|b| b.id == id)
        {
            result.push(current);
        }
        result.extend(candidates.into_iter().take(top_k));
        result
    }
}
