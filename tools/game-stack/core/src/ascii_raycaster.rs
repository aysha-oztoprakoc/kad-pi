//! 3D ASCII Raycaster Engine for Gaya Text-RPG.
//!
//! Based on mathematical specifications from RESEARCH_SNAPSHOT_GAYA_3D_ASCII_PIANO_2026-09-08.md:
//! - Pure software DDA raycasting with perpendicular wall distance calculation.
//! - Aspect-ratio compensation (~0.55) for monospace terminal fonts (~2:1 cell height:width).
//! - Ordered ASCII density ramps for depth shading with orientation shadow.
//! - Canonical YKT Refuge room templates (Commons, Kitchen, Synthesis Chamber).


/// Tile type in a room map.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Tile {
    Empty = 0,
    HeartwoodWall = 1,
    DouglasWood = 2,
    SynthesisAltar = 3,
    Archway = 4,
    InteractiveProp = 5,
}

impl Tile {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => Tile::HeartwoodWall,
            2 => Tile::DouglasWood,
            3 => Tile::SynthesisAltar,
            4 => Tile::Archway,
            5 => Tile::InteractiveProp,
            _ => Tile::Empty,
        }
    }

    pub fn is_solid(&self) -> bool {
        matches!(
            self,
            Tile::HeartwoodWall | Tile::DouglasWood | Tile::SynthesisAltar | Tile::InteractiveProp
        )
    }
}

/// Shading density ramp styles.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RampStyle {
    /// Unicode block ramp: [" ", "░", "▒", "▓", "█"]
    Blocks,
    /// Detailed ASCII characters: [" ", ".", ":", "-", "=", "+", "*", "#", "%", "@"]
    Detailed,
}

impl RampStyle {
    pub fn glyphs(&self) -> &'static [char] {
        match self {
            RampStyle::Blocks => &[' ', '░', '▒', '▓', '█'],
            RampStyle::Detailed => &[' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],
        }
    }
}

/// 2D Map of a room.
#[derive(Debug, Clone)]
pub struct RoomMap {
    pub width: usize,
    pub height: usize,
    pub tiles: Vec<Tile>,
    pub name: String,
}

impl RoomMap {
    pub fn new(width: usize, height: usize, name: impl Into<String>) -> Self {
        Self {
            width,
            height,
            tiles: vec![Tile::Empty; width * height],
            name: name.into(),
        }
    }

    #[inline]
    pub fn get(&self, x: usize, y: usize) -> Tile {
        if x < self.width && y < self.height {
            self.tiles[y * self.width + x]
        } else {
            Tile::HeartwoodWall // Out of bounds treated as solid
        }
    }

    #[inline]
    pub fn set(&mut self, x: usize, y: usize, tile: Tile) {
        if x < self.width && y < self.height {
            self.tiles[y * self.width + x] = tile;
        }
    }

    /// Creates canonical "Commons do Coração" (16x16 with central hearth table and archways).
    pub fn commons_do_coracao() -> Self {
        let mut map = Self::new(16, 16, "Commons do Coração");
        // Perimeter walls
        for x in 0..16 {
            map.set(x, 0, Tile::HeartwoodWall);
            map.set(x, 15, Tile::HeartwoodWall);
        }
        for y in 0..16 {
            map.set(0, y, Tile::HeartwoodWall);
            map.set(15, y, Tile::HeartwoodWall);
        }
        // Archways (North to Pantry/Kitchen, South to Terrace, East to Mana, West to Salon)
        map.set(8, 0, Tile::Archway);
        map.set(8, 15, Tile::Archway);
        map.set(0, 8, Tile::Archway);
        map.set(15, 8, Tile::Archway);

        // Central council table / hearth (interactive)
        for x in 7..=9 {
            for y in 7..=9 {
                map.set(x, y, Tile::InteractiveProp);
            }
        }
        map
    }

    /// Creates canonical "Cozinha do Refúgio" (12x12 with stoves and pantry connection).
    pub fn cozinha_do_refugio() -> Self {
        let mut map = Self::new(12, 12, "Cozinha do Refúgio");
        for x in 0..12 {
            map.set(x, 0, Tile::DouglasWood);
            map.set(x, 11, Tile::DouglasWood);
        }
        for y in 0..12 {
            map.set(0, y, Tile::DouglasWood);
            map.set(11, y, Tile::DouglasWood);
        }
        // Door to Commons
        map.set(6, 0, Tile::Archway);
        // Stoves along the east wall
        map.set(10, 3, Tile::InteractiveProp);
        map.set(10, 4, Tile::InteractiveProp);
        map.set(10, 5, Tile::InteractiveProp);
        map
    }

    /// Creates canonical "Câmara de Síntese" (14x14 with central transmutation crucible).
    pub fn camara_de_sintese() -> Self {
        let mut map = Self::new(14, 14, "Câmara de Síntese");
        for x in 0..14 {
            map.set(x, 0, Tile::SynthesisAltar);
            map.set(x, 13, Tile::SynthesisAltar);
        }
        for y in 0..14 {
            map.set(0, y, Tile::SynthesisAltar);
            map.set(13, y, Tile::SynthesisAltar);
        }
        // Entrance from deep roots
        map.set(7, 13, Tile::Archway);
        // Central Crucible (3x3)
        for x in 6..=8 {
            for y in 6..=8 {
                map.set(x, y, Tile::SynthesisAltar);
            }
        }
        map
    }
}

/// 3D Camera and player pose.
#[derive(Debug, Clone)]
pub struct Camera {
    pub pos_x: f64,
    pub pos_y: f64,
    pub dir_x: f64,
    pub dir_y: f64,
    pub plane_x: f64,
    pub plane_y: f64,
}

impl Camera {
    /// Creates camera at position `(x, y)` facing `angle_rad`.
    /// `fov_rad` default is ~66 degrees (~1.15 rad), plane magnitude = tan(fov/2).
    pub fn new(x: f64, y: f64, angle_rad: f64) -> Self {
        let dir_x = angle_rad.cos();
        let dir_y = angle_rad.sin();
        let fov_scale = (33.0_f64.to_radians()).tan(); // ~0.66 plane length
        let plane_x = -dir_y * fov_scale;
        let plane_y = dir_x * fov_scale;

        Self {
            pos_x: x,
            pos_y: y,
            dir_x,
            dir_y,
            plane_x,
            plane_y,
        }
    }

    pub fn set_pose(&mut self, x: f64, y: f64, angle_rad: f64) {
        self.pos_x = x;
        self.pos_y = y;
        self.dir_x = angle_rad.cos();
        self.dir_y = angle_rad.sin();
        let fov_scale = (33.0_f64.to_radians()).tan();
        self.plane_x = -self.dir_y * fov_scale;
        self.plane_y = self.dir_x * fov_scale;
    }
}

/// A hit record produced by DDA.
#[derive(Debug, Clone, Copy)]
pub struct RayHit {
    pub perp_dist: f64,
    pub tile: Tile,
    pub side: u8, // 0 for vertical (X), 1 for horizontal (Y)
    pub wall_x: f64,
}

/// 3D ASCII Raycaster.
#[derive(Debug, Clone)]
pub struct AsciiRaycaster {
    pub camera: Camera,
    pub map: RoomMap,
    pub aspect_factor: f64,
    pub ramp_style: RampStyle,
    pub max_depth: f64,
}

impl AsciiRaycaster {
    pub fn new(map: RoomMap) -> Self {
        Self {
            camera: Camera::new(4.0, 4.0, 0.0),
            map,
            aspect_factor: 0.55,
            ramp_style: RampStyle::Blocks,
            max_depth: 16.0,
        }
    }

    /// Casts a single ray for column `x` out of screen `width`.
    pub fn cast_ray(&self, col: usize, width: usize) -> Option<RayHit> {
        if width == 0 {
            return None;
        }
        let camera_x = 2.0 * (col as f64) / (width as f64) - 1.0;
        let ray_dir_x = self.camera.dir_x + self.camera.plane_x * camera_x;
        let ray_dir_y = self.camera.dir_y + self.camera.plane_y * camera_x;

        let mut map_x = self.camera.pos_x.floor() as i32;
        let mut map_y = self.camera.pos_y.floor() as i32;

        let delta_dist_x = if ray_dir_x.abs() < 1e-12 {
            1e30
        } else {
            (1.0 / ray_dir_x).abs()
        };
        let delta_dist_y = if ray_dir_y.abs() < 1e-12 {
            1e30
        } else {
            (1.0 / ray_dir_y).abs()
        };

        let (step_x, mut side_dist_x) = if ray_dir_x < 0.0 {
            (-1, (self.camera.pos_x - map_x as f64) * delta_dist_x)
        } else {
            (1, (map_x as f64 + 1.0 - self.camera.pos_x) * delta_dist_x)
        };

        let (step_y, mut side_dist_y) = if ray_dir_y < 0.0 {
            (-1, (self.camera.pos_y - map_y as f64) * delta_dist_y)
        } else {
            (1, (map_y as f64 + 1.0 - self.camera.pos_y) * delta_dist_y)
        };

        let mut side = 0u8;
        let mut hit = false;
        let mut hit_tile = Tile::Empty;

        // DDA Step loop
        for _ in 0..64 {
            if side_dist_x < side_dist_y {
                side_dist_x += delta_dist_x;
                map_x += step_x;
                side = 0;
            } else {
                side_dist_y += delta_dist_y;
                map_y += step_y;
                side = 1;
            }

            if map_x < 0
                || map_x >= self.map.width as i32
                || map_y < 0
                || map_y >= self.map.height as i32
            {
                hit = true;
                hit_tile = Tile::HeartwoodWall;
                break;
            }

            let tile = self.map.get(map_x as usize, map_y as usize);
            if tile.is_solid() {
                hit = true;
                hit_tile = tile;
                break;
            }
        }

        if !hit {
            return None;
        }

        let perp_dist = if side == 0 {
            side_dist_x - delta_dist_x
        } else {
            side_dist_y - delta_dist_y
        };

        let perp_dist = perp_dist.max(0.1); // Avoid zero division

        let wall_x = if side == 0 {
            self.camera.pos_y + perp_dist * ray_dir_y
        } else {
            self.camera.pos_x + perp_dist * ray_dir_x
        };
        let wall_x = wall_x - wall_x.floor();

        Some(RayHit {
            perp_dist,
            tile: hit_tile,
            side,
            wall_x,
        })
    }

    #[allow(clippy::needless_range_loop)]
    /// Renders a 2D ASCII frame buffer of size `width` x `height`.
    pub fn render_frame(&self, width: usize, height: usize) -> Vec<String> {
        let mut frame = vec![vec![' '; width]; height];
        let glyphs = self.ramp_style.glyphs();
        let num_glyphs = glyphs.len();

        for col in 0..width {
            if let Some(hit) = self.cast_ray(col, width) {
                // Wall slice height
                let wall_h = ((height as f64 / hit.perp_dist) * self.aspect_factor) as usize;
                let draw_start = (height.saturating_sub(wall_h) / 2).min(height);
                let draw_end = ((height + wall_h) / 2).min(height);

                // Ceiling (with subtle depth dots)
                for row in 0..draw_start {
                    let ceiling_dist = (height as f64) / ((height as f64) - 2.0 * (row as f64));
                    if ceiling_dist > 4.0 && (col + row) % 6 == 0 {
                        frame[row][col] = '·';
                    } else {
                        frame[row][col] = ' ';
                    }
                }

                // Wall glyph calculation
                let norm_dist = (hit.perp_dist / self.max_depth).clamp(0.0, 1.0);
                // Inverse ramp: near = solid, far = faint
                let ramp_idx = ((1.0 - norm_dist) * ((num_glyphs - 1) as f64)).round() as usize;
                let mut glyph_idx = ramp_idx.min(num_glyphs - 1);

                // Differentiate orthogonal side (shadow for side 1)
                if hit.side == 1 && glyph_idx > 0 {
                    glyph_idx -= 1;
                }

                let wall_char = glyphs[glyph_idx];
                for row in draw_start..draw_end {
                    frame[row][col] = wall_char;
                }

                // Floor (depth shaded)
                for row in draw_end..height {
                    let floor_dist = (height as f64) / (2.0 * (row as f64) - (height as f64));
                    if floor_dist < 2.0 {
                        frame[row][col] = '=';
                    } else if floor_dist < 4.0 {
                        frame[row][col] = '-';
                    } else if (col + row) % 4 == 0 {
                        frame[row][col] = '.';
                    } else {
                        frame[row][col] = ' ';
                    }
                }
            }
        }

        frame
            .into_iter()
            .map(|row| row.into_iter().collect())
            .collect()
    }

    /// Renders frame as a single joined string with newlines.
    pub fn render_to_string(&self, width: usize, height: usize) -> String {
        self.render_frame(width, height).join("\n")
    }
}
