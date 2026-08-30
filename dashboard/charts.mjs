/**
 * Sofia v3 Modular ECharts Manager
 *
 * Invariants:
 * 1. Charts are presentation only; zero business logic.
 * 2. Responsive resize is automatically handled.
 * 3. Graceful degradation: if ECharts fails to load or throw an exception,
 *    a clean textual/tabular summary fallback is rendered.
 */

import { buildWorkpackageStatusChartOptions, buildProjectClassificationChartOptions } from './adapter.mjs';

let echartsLib = null;
const activeInstances = new Set();

export async function getECharts() {
  if (echartsLib) return echartsLib;
  try {
    const mod = await import('echarts');
    echartsLib = mod.default || mod;
    return echartsLib;
  } catch (error) {
    console.warn('[Sofia Charts] ECharts module failed to load:', error.message);
    return null;
  }
}

export function disposeAllCharts() {
  for (const instance of activeInstances) {
    try {
      instance.dispose();
    } catch {
      // Ignore cleanup error on dead DOM
    }
  }
  activeInstances.clear();
}

export async function renderChart(container, options) {
  if (!container) return null;

  const echarts = await getECharts();
  if (!echarts) {
    container.innerHTML = '<div class="degraded-chart-fallback"><p class="faint">Chart rendering unavailable (ECharts module not loaded). Native summaries remain active.</p></div>';
    return null;
  }

  try {
    let instance = echarts.getInstanceByDom(container);
    if (!instance) {
      instance = echarts.init(container, null, { renderer: 'canvas' });
      activeInstances.add(instance);
    }
    instance.setOption(options, true);
    return instance;
  } catch (error) {
    console.error('[Sofia Charts] Chart initialization failed:', error);
    container.innerHTML = `<div class="degraded-chart-fallback"><p class="error">Chart visualization error: ${error.message}</p></div>`;
    return null;
  }
}

// Window resize listener
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    for (const instance of activeInstances) {
      try {
        instance.resize();
      } catch {
        // Safe no-op
      }
    }
  });
}
