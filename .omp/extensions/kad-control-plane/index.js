import { createKadControlPlaneExtension } from '../../../tools/kad/telemetry/control-plane-runtime.mjs';

export default function kadControlPlane(pi) {
  return createKadControlPlaneExtension(pi);
}
