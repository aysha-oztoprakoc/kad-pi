import { execFileSync } from 'node:child_process';

export function collectGpuTelemetry({
  runner = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 }),
  now = Date.now(),
} = {}) {
  try {
    const raw = runner('amdgpu_top', ['-J', '-n', '1']);
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const device = parsed?.devices?.[0];

    if (!device) {
      return {
        state: 'UNAVAILABLE',
        reason: 'No AMD GPU device detected in output',
        observed_at: now,
      };
    }

    const info = device.Info || {};
    const vram = device.VRAM || {};
    const sensors = device.Sensors || {};
    const activity = device.gpu_activity || {};

    const deviceName = info.DeviceName || info['ASIC Name'] || 'AMD GPU';
    const vramTotal = vram['Total VRAM']?.value ?? null;
    const vramUsed = vram['Total VRAM Usage']?.value ?? null;
    const utilPercent = activity.GFX?.value ?? null;
    const tempC = sensors['Edge Temperature']?.value ?? sensors['Junction Temperature']?.value ?? null;
    const powerW = sensors['Average Power']?.value ?? sensors['GFX Power']?.value ?? null;

    return {
      state: 'AVAILABLE',
      device_name: deviceName,
      vram_used_mib: vramUsed,
      vram_total_mib: vramTotal,
      gpu_utilization_percent: utilPercent,
      temperature_c: tempC,
      power_w: powerW,
      observed_at: now,
    };
  } catch (error) {
    return {
      state: 'UNAVAILABLE',
      reason: error?.message || 'amdgpu_top execution failed',
      observed_at: now,
    };
  }
}
