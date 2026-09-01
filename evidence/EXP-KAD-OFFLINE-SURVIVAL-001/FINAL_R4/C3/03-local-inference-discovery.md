# C3-03 Local Inference Discovery

## Required capability

The frozen experiment hypothesis requires local inference survival. The canonical experiment-local runtime is KoboldCpp serving the KAD WORLD-only Stheno model.

| Field | Observed/Required |
|---|---|
| Required capability | local WORLD inference |
| Runtime | KoboldCpp `v1.119` |
| Model | `L3-8B-Stheno-v3.2-Q4_K_M` |
| Endpoint | `http://127.0.0.1:5001/v1` |
| Process/start mechanism | existing manual KoboldCpp binary and runbook |
| GPU | AMD Radeon RX 9060 XT; Vulkan device 0 per runbook, startup log must be retained |
| Required by hypothesis | yes |
| Configuration provenance | `kad-sillytavern/RUNBOOK.md`, `config/local-models.registry.json`, `.omp/models.yml`, `pi/local-models.json` |

Existing assets are present:

- binary: `/home/amdy/Work/kad-sillytavern/koboldcpp/koboldcpp-linux-x64-nocuda`
- binary SHA-256: `5cf4e7530782cfe88717966fdf2b13fd2073ce3879ba127be6a5ad65ebf5c547`
- model: `/home/amdy/Work/.models/gguf/world/L3-8B-Stheno-v3.2-Q4_K_M.gguf`
- model SHA-256 from registry: `8e98c1953f9c04e060fd9640bbe866685c844363a2360f09099b79c6c9195fc4`

Classification before startup: `STOPPED_BUT_AVAILABLE`. No download, installation, persistent configuration change, or privileged service was used.
