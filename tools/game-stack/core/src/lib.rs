pub mod gaya_world;
pub mod ascii_raycaster;

use fixed::types::I32F32;
use serde::{Deserialize, Serialize};

#[derive(Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct State {
    pub tick: u32,
    pub position: I32F32,
}

impl State {
    pub fn advance(&mut self, input: i8) {
        // Exact binary fraction: qualification exercises fixed-point arithmetic
        // without silently rounding a 1/60-second timestep.
        self.position = self
            .position
            .checked_add(I32F32::from_num(input) / 64)
            .expect("qualification position must remain representable");
        self.tick = self
            .tick
            .checked_add(1)
            .expect("qualification tick overflow");
    }
}

pub fn replay() -> String {
    let inputs = [1, -1, 2, 0, -2, 3, 1, -1];
    let mut uninterrupted = State::default();
    let mut restored = State::default();
    for tick in 0..600 {
        let input = inputs[tick % inputs.len()];
        uninterrupted.advance(input);
        restored.advance(input);
        if tick == 299 {
            let snapshot = serde_json::to_string(&restored).expect("serialize qualification state");
            restored = serde_json::from_str(&snapshot).expect("restore qualification state");
        }
    }
    assert_eq!(uninterrupted, restored, "snapshot replay diverged");
    format!(
        "ticks={} position_bits={} snapshot_equal=true",
        restored.tick,
        restored.position.to_bits()
    )
}
