/**
 * Hardware Confounder & Environment Baseline Collector
 * Authority: D021-004 (Thermal, Compositor, and ROCm Confounder Isolation)
 */

import { spawnSync } from 'node:child_process';

export function captureEnvironmentBaseline({ gpuDevice = 'amdgpu:0', mock = false } = {}) {
  if (mock) {
    return {
      timestamp: new Date().toISOString(),
      gpu_device: gpuDevice,
      gpu_temperature_c: 42.0,
      gpu_power_watts: 18.5,
      compositor_load_percent: 2.1,
      vram_baseline_used_bytes: 524288000,
      rocm_version: '6.2.0-mock',
      driver_version: 'amdgpu-7.1.9',
      confounder_status: 'NOMINAL',
      is_simulated: true
    };
  }

  let temp = null;
  let power = null;
  let vramUsed = null;
  let rocmVersion = null;
  let driverVersion = null;
  let compositorLoad = null;

  try {
    const res = spawnSync('amdgpu_top', ['--json', '-n', '1'], { encoding: 'utf8', timeout: 2000 });
    if (res.status === 0 && res.stdout) {
      const parsed = JSON.parse(res.stdout);
      if (parsed.devices && parsed.devices[0]) {
        const d = parsed.devices[0];
        temp = Number.isFinite(Number(d.temp)) ? Number(d.temp) : null;
        power = Number.isFinite(Number(d.power)) ? Number(d.power) : null;
        vramUsed = Number.isFinite(Number(d.vram_used_bytes)) ? Number(d.vram_used_bytes) : null;
        rocmVersion = d.rocm_version || null;
        driverVersion = d.driver_version || 'amdgpu';
      }
    }
  } catch {
    // amdgpu_top failed or missing
  }

  if (temp === null && power === null) {
    return {
      timestamp: new Date().toISOString(),
      gpu_device: gpuDevice,
      gpu_temperature_c: null,
      gpu_power_watts: null,
      compositor_load_percent: null,
      vram_baseline_used_bytes: null,
      rocm_version: null,
      driver_version: null,
      confounder_status: 'UNAVAILABLE',
      unavailability_reason: 'Hardware telemetry tool (amdgpu_top) failed or unavailable for device'
    };
  }

  return {
    timestamp: new Date().toISOString(),
    gpu_device: gpuDevice,
    gpu_temperature_c: temp,
    gpu_power_watts: power,
    compositor_load_percent: compositorLoad,
    vram_baseline_used_bytes: vramUsed,
    rocm_version: rocmVersion,
    driver_version: driverVersion,
    confounder_status: (temp !== null && temp > 80.0) ? 'ELEVATED_TEMPERATURE' : 'NOMINAL'
  };
}

export function isConfounderElevated(baseline = {}) {
  return (
    (baseline.gpu_temperature_c || 0) > 80.0 ||
    (baseline.compositor_load_percent || 0) > 25.0
  );
}
