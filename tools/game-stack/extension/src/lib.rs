use godot::builtin::{Array, PackedStringArray, VarDictionary};
use godot::prelude::*;

use stack_core::ascii_raycaster::{AsciiRaycaster, RoomMap};
use stack_core::gaya_world::{Currency, GayaWorld, MoBABlockContextBuffer};

struct StackExtension;

#[gdextension]
unsafe impl ExtensionLibrary for StackExtension {}

/// Bridge exposing `stack_core::gaya_world` to GDScript.
///
/// Wraps the sealed Gaya G1 world loader, verified mechanics (RD 2 Kravarius
/// crust, True Damage, currency conversion, synthesis validation), spatial
/// routing, and the MoBA-inspired in-game block context buffer.
#[derive(GodotClass)]
#[class(init, base=RefCounted)]
pub struct GayaBridge {
    base: Base<RefCounted>,
    world: Option<GayaWorld>,
    buffer: MoBABlockContextBuffer,
    raycaster: Option<AsciiRaycaster>,
}

#[godot_api]
impl GayaBridge {
    /// Load a world from the raw JSON text of `world.json` plus the JSONL text
    /// of `assets.jsonl`. Returns true on success.
    #[func]
    fn load_from_json(&mut self, world_json: GString, assets_jsonl: GString) -> bool {
        match GayaWorld::from_json(&world_json.to_string(), &assets_jsonl.to_string()) {
            Ok(world) => {
                self.world = Some(world);
                true
            }
            Err(_) => false,
        }
    }

    /// Load the world from a sealed release directory containing
    /// `game/world.json` and `game/assets.jsonl`. Returns true on success.
    #[func]
    fn load_release(&mut self, release_dir: GString) -> bool {
        match GayaWorld::load_from_release_dir(std::path::Path::new(&release_dir.to_string())) {
            Ok(world) => {
                self.world = Some(world);
                true
            }
            Err(_) => false,
        }
    }

    /// Number of entities in the loaded world (0 when none is loaded).
    #[func]
    fn get_entity_count(&self) -> i64 {
        self.world
            .as_ref()
            .map_or(0, |w| w.entities.len() as i64)
    }

    /// Number of spatial nodes in the loaded world (0 when none is loaded).
    #[func]
    fn get_spatial_node_count(&self) -> i64 {
        self.world
            .as_ref()
            .map_or(0, |w| w.spatial_nodes.len() as i64)
    }

    /// Damage dealt: `true_damage` bypasses reduction; `incoming` is reduced by
    /// RD 2 when `has_kravarius_crust` (never below 0).
    #[func]
    fn calculate_damage(&self, incoming: i64, true_damage: i64, has_kravarius_crust: bool) -> i64 {
        stack_core::gaya_world::calculate_damage(
            incoming as u32,
            true_damage as u32,
            has_kravarius_crust,
        ) as i64
    }

    /// Convert `amount` between `Yorman` and `Khan` (1 Yorman = 100 Khan).
    /// Unknown currencies convert to 0.
    #[func]
    fn convert_currency(&self, amount: i64, from_currency: GString, to_currency: GString) -> i64 {
        let (Some(from), Some(to)) = (
            parse_currency(&from_currency.to_string()),
            parse_currency(&to_currency.to_string()),
        ) else {
            return 0;
        };
        stack_core::gaya_world::convert_currency(amount as u32, from, to) as i64
    }

    /// Validate a synthesis target: empty string when allowed, else the
    /// canonical `VIOLATION` message for living tissue.
    #[func]
    fn validate_synthesis(&self, is_living_tissue: bool) -> GString {
        match stack_core::gaya_world::validate_synthesis(is_living_tissue) {
            Ok(()) => GString::new(),
            Err(message) => GString::from(message.as_str()),
        }
    }

    /// Shortest spatial slug path between two nodes (empty when no world is
    /// loaded or the nodes are disconnected).
    #[func]
    fn find_route(&self, from: GString, to: GString) -> PackedStringArray {
        let Some(world) = self.world.as_ref() else {
            return PackedStringArray::new();
        };
        match world.find_route(&from.to_string(), &to.to_string()) {
            Some(path) => path
                .iter()
                .map(|slug| GString::from(slug.as_str()))
                .collect(),
            None => PackedStringArray::new(),
        }
    }

    /// Append a dialogue/event block to the context buffer. Returns the
    /// assigned monotonically increasing block id.
    #[func]
    fn moba_add_context_block(
        &mut self,
        spatial_node: GString,
        entities: PackedStringArray,
        text: GString,
    ) -> i64 {
        let entity_strings: Vec<String> = entities
            .to_vec()
            .into_iter()
            .map(|e| e.to_string())
            .collect();
        self.buffer.add(spatial_node.to_string(), entity_strings, text.to_string()) as i64
    }

    /// Query the buffer's most relevant blocks for the current play context.
    /// Each dictionary has "id", "spatial_node", "entities", and "text" keys.
    #[func]
    fn moba_query_relevant(
        &self,
        current_node: GString,
        active_entities: PackedStringArray,
        top_k: i64,
    ) -> Array<VarDictionary> {
        let active: Vec<String> = active_entities
            .to_vec()
            .into_iter()
            .map(|e| e.to_string())
            .collect();
        let active_refs: Vec<&str> = active.iter().map(String::as_str).collect();
        let blocks = self.buffer.query_relevant_blocks(
            &current_node.to_string(),
            &active_refs,
            top_k.max(0) as usize,
        );
        blocks
            .into_iter()
            .map(|block| {
                let mut dictionary = VarDictionary::new();
                dictionary.set("id", block.id as i64);
                dictionary.set("spatial_node", &GString::from(block.spatial_node.as_str()));
                dictionary.set(
                    "entities",
                    &block
                        .entities
                        .iter()
                        .map(|entity| GString::from(entity.as_str()))
                        .collect::<PackedStringArray>(),
                );
                dictionary.set("text", &GString::from(block.text.as_str()));
                dictionary
            })
            .collect()
    }

    /// Select the active room map for 3D ASCII raycasting ("commons", "kitchen", "synthesis").
    #[func]
    fn set_room_map(&mut self, room_slug: GString) -> bool {
        let slug = room_slug.to_string();
        let map = match slug.to_ascii_lowercase().as_str() {
            "kitchen" | "cozinha" => RoomMap::cozinha_do_refugio(),
            "synthesis" | "camara_de_sintese" => RoomMap::camara_de_sintese(),
            _ => RoomMap::commons_do_coracao(),
        };
        self.raycaster = Some(AsciiRaycaster::new(map));
        true
    }

    /// Renders a 3D ASCII frame as a single string with newlines for the given pose and dimensions.
    #[func]
    fn render_ascii_frame(
        &mut self,
        x: f64,
        y: f64,
        angle_rad: f64,
        width: i64,
        height: i64,
    ) -> GString {
        let raycaster = self
            .raycaster
            .get_or_insert_with(|| AsciiRaycaster::new(RoomMap::commons_do_coracao()));
        raycaster.camera.set_pose(x, y, angle_rad);
        let w = (width.clamp(10, 200)) as usize;
        let h = (height.clamp(5, 80)) as usize;
        let frame_str = raycaster.render_to_string(w, h);
        GString::from(&frame_str)
    }
}

/// Parse a currency name (case-insensitive) into a [`Currency`].
fn parse_currency(name: &str) -> Option<Currency> {
    match name.to_ascii_lowercase().as_str() {
        "khan" => Some(Currency::Khan),
        "yorman" => Some(Currency::Yorman),
        _ => None,
    }
}
