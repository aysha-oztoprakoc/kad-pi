use stack_core::ascii_raycaster::{AsciiRaycaster, RampStyle, RoomMap};
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let room_type = args.get(1).map(|s| s.as_str()).unwrap_or("commons");
    let width: usize = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(80);
    let height: usize = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(24);

    let map = match room_type {
        "kitchen" | "cozinha" => RoomMap::cozinha_do_refugio(),
        "synthesis" | "camara_de_sintese" => RoomMap::camara_de_sintese(),
        _ => RoomMap::commons_do_coracao(),
    };

    let mut raycaster = AsciiRaycaster::new(map);
    raycaster.ramp_style = RampStyle::Blocks;
    // Position inside the room looking at center
    raycaster.camera.set_pose(4.0, 4.0, 0.4);

    println!(
        "\x1b[1;36m=== Gaya 3D ASCII Terminal Viewport: {} ({}x{}) ===\x1b[0m",
        raycaster.map.name, width, height
    );
    let frame = raycaster.render_to_string(width, height);
    println!("{}", frame);
    println!("\x1b[1;32m[Player Pose: x={:.1}, y={:.1}, angle={:.2} rad]\x1b[0m", 4.0, 4.0, 0.4);
}
