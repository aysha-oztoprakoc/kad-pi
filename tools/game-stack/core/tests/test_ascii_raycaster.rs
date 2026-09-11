use stack_core::ascii_raycaster::{
    AsciiRaycaster, Camera, RampStyle, RoomMap, Tile,
};
use std::f64::consts::PI;

#[test]
fn test_room_map_creation_and_bounds() {
    let mut map = RoomMap::new(10, 10, "Test Room");
    assert_eq!(map.width, 10);
    assert_eq!(map.height, 10);

    assert_eq!(map.get(5, 5), Tile::Empty);
    map.set(5, 5, Tile::HeartwoodWall);
    assert_eq!(map.get(5, 5), Tile::HeartwoodWall);

    // Out of bounds returns solid wall
    assert_eq!(map.get(100, 100), Tile::HeartwoodWall);
}

#[test]
fn test_canonical_room_templates() {
    let commons = RoomMap::commons_do_coracao();
    assert_eq!(commons.width, 16);
    assert_eq!(commons.height, 16);
    assert!(commons.get(0, 0).is_solid());
    assert_eq!(commons.get(8, 0), Tile::Archway);
    assert_eq!(commons.get(8, 8), Tile::InteractiveProp);

    let kitchen = RoomMap::cozinha_do_refugio();
    assert_eq!(kitchen.width, 12);
    assert_eq!(kitchen.height, 12);
    assert_eq!(kitchen.get(10, 3), Tile::InteractiveProp);

    let synthesis = RoomMap::camara_de_sintese();
    assert_eq!(synthesis.width, 14);
    assert_eq!(synthesis.height, 14);
    assert_eq!(synthesis.get(7, 7), Tile::SynthesisAltar);
}

#[test]
fn test_camera_direction_and_fov_plane() {
    let camera = Camera::new(5.0, 5.0, 0.0); // Facing East (1, 0)
    assert!((camera.dir_x - 1.0).abs() < 1e-6);
    assert!(camera.dir_y.abs() < 1e-6);
    // Camera plane should be perpendicular: (0, 0.66)
    assert!(camera.plane_x.abs() < 1e-6);
    assert!(camera.plane_y > 0.6 && camera.plane_y < 0.7);

    // Facing North (-PI/2): dir = (0, -1)
    let camera_north = Camera::new(5.0, 5.0, -PI / 2.0);
    assert!(camera_north.dir_x.abs() < 1e-6);
    assert!((camera_north.dir_y - (-1.0)).abs() < 1e-6);
}

#[test]
fn test_raycaster_hit_and_perp_distance() {
    let map = RoomMap::commons_do_coracao();
    let mut raycaster = AsciiRaycaster::new(map);
    // Position in middle of commons (5.0, 5.0), facing East (angle 0)
    raycaster.camera.set_pose(5.0, 5.0, 0.0);

    // Cast center ray (width 80, col 40)
    let hit = raycaster.cast_ray(40, 80).expect("center ray must hit a wall or prop");
    assert!(hit.perp_dist > 0.0);
    // Since facing East from 5.0, central table is at x=7..9 -> should hit interactive prop or wall
    assert!(hit.tile.is_solid());

    // Facing West (PI) from (5.0, 5.0): should hit west wall (x=0) at distance ~4.0
    raycaster.camera.set_pose(5.0, 5.0, PI);
    let hit_west = raycaster.cast_ray(40, 80).expect("west ray must hit wall");
    assert!((hit_west.perp_dist - 4.0).abs() < 0.2);
    assert_eq!(hit_west.tile, Tile::HeartwoodWall);
}

#[test]
fn test_render_frame_dimensions_and_glyphs() {
    let map = RoomMap::commons_do_coracao();
    let mut raycaster = AsciiRaycaster::new(map);
    raycaster.camera.set_pose(5.0, 5.0, 0.0);

    let width = 60;
    let height = 20;
    let frame = raycaster.render_frame(width, height);

    assert_eq!(frame.len(), height);
    for row in &frame {
        assert_eq!(row.chars().count(), width);
    }

    // Render with Detailed ramp
    raycaster.ramp_style = RampStyle::Detailed;
    let text = raycaster.render_to_string(width, height);
    assert_eq!(text.lines().count(), height);
}
