---
title: "Cosmos Reason2 Models on Jetson"
description: "Run NVIDIA Cosmos Reason2 (2B / 8B) models on Jetson with vLLM and connect to Live VLM WebUI for real-time vision inference."
category: "VLM"
section: "Vision Language Models"
order: 2
tags: ["vlm", "vision", "cosmos", "cosmos-reason2", "vllm", "fp8", "jetson-orin", "jetson-thor", "ngc", "live-vlm-webui", "multimodal", "reasoning", "2b", "8b"]
model: "vllm"
authors:
  - name: "Johnny Nuñez"
    github: "johnnynunez"
---

![Cosmos Reason2 on Jetson](/images/tutorials/cosmos-reason2-8b.jpg)

[NVIDIA Cosmos Reason2](https://huggingface.co/collections/nvidia/cosmos-reason2-68505a885fc2bfe0c1bd8a73) is a family of vision-language models with built-in chain-of-thought reasoning capabilities. The family includes two sizes:

- **Cosmos Reason2 2B** — a compact model ideal for memory-constrained edge devices, capable of spatial reasoning, anomaly detection, and scene analysis.
- **Cosmos Reason2 8B** — a larger model that delivers stronger reasoning accuracy while still fitting on Jetson AGX platforms.

Both models are available in quantized formats (FP8 for vLLM, FP4/other GGUF variants for llama.cpp) and can be served on Jetson. This tutorial walks through downloading, serving, and connecting either model to **[Live VLM WebUI](https://github.com/NVIDIA-AI-IOT/live-vlm-webui)** for real-time webcam-based inference.


## Prerequisites

| Requirement | Details |
|---|---|
| **Devices** | Jetson AGX Thor, AGX Orin (64 GB / 32 GB), Orin Super Nano |
| **JetPack** | JP 6 (L4T r36.x) for Orin · JP 7 (L4T r38.x) for Thor |
| **Storage** | NVMe SSD required — ~5 GB (2B) / ~17 GB (8B) for weights, ~8 GB for vLLM image |
| **Accounts** | [NVIDIA NGC](https://ngc.nvidia.com/) (free) — for NGC CLI and model download |


## Which Model Should I Choose using vLLM?

| | Cosmos Reason2 2B | Cosmos Reason2 8B |
|---|---|---|
| **Parameters** | 2 billion | 8 billion |
| **FP8 Weights** | ~5 GB | ~17 GB |
| **Supported Devices** | Thor, AGX Orin, Orin Super Nano | Thor, AGX Orin |
| **Reasoning Strength** | Good — spatial reasoning, anomaly detection | Stronger — more detailed analysis and accuracy |
| **Best For** | Memory-constrained deployments, fast prototyping | Higher-accuracy reasoning when memory allows |

> **Important:** **Orin Super Nano** supports only the **2B model** when running with vLLM due to memory constraints.

> **Tip:** If you prefer a lighter-weight setup (especially on Orin Nano), both models are also available as GGUF checkpoints for [llama.cpp](/models/cosmos-reason2-2b). See the individual model pages for [Cosmos Reason2 2B](/models/cosmos-reason2-2b) and [Cosmos Reason2 8B](/models/cosmos-reason2-8b).

## Overview

| | Jetson AGX Thor | Jetson AGX Orin | Orin Super Nano |
|---|---|---|---|
| **vLLM Container** | `ghcr.io/nvidia-ai-iot/vllm:latest-jetson-thor` | `ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin` | `ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin` |
| **Model** | FP8 2B or 8B via NGC | FP8 2B or 8B via NGC | FP8 2B via NGC |
| **Max Model Length** | 8192 tokens | 8192 tokens | 768 tokens (memory-constrained) |
| **GPU Memory Util** | 0.8 | 0.8 | 0.52 |

The workflow is the same for both models and all devices:

1. **Download** the FP8 model checkpoint via NGC CLI
2. **Pull** the vLLM Docker image for your device
3. **Launch** the container with the model mounted as a volume
4. **Connect** Live VLM WebUI to the vLLM endpoint


## Step 1: Install the NGC CLI

The NGC CLI lets you download model checkpoints from the [NVIDIA NGC Catalog](https://catalog.ngc.nvidia.com/?tab=model).

### Download and install

```bash
mkdir -p ~/Projects/CosmosReason2
cd ~/Projects/CosmosReason2

# Download the NGC CLI for ARM64
# Get the latest installer URL from: https://org.ngc.nvidia.com/setup/installers/cli
wget -O ngccli_arm64.zip https://api.ngc.nvidia.com/v2/resources/nvidia/ngc-apps/ngc_cli/versions/4.13.0/files/ngccli_arm64.zip
unzip ngccli_arm64.zip
chmod u+x ngc-cli/ngc

# Add to PATH
export PATH="$PATH:$(pwd)/ngc-cli"
```

### Configure the CLI

```bash
ngc config set
```

You will be prompted for:
- **API Key** — generate one at [NGC API Key setup](https://org.ngc.nvidia.com/setup/api-key)
- **CLI output format** — choose `json` or `ascii`
- **org** — press Enter to accept the default


## Step 2: Download the Model

Download the FP8-quantized checkpoint for the model you want to run.

### Cosmos Reason2 2B (all devices)

```bash
cd ~/Projects/CosmosReason2
ngc registry model download-version "nim/nvidia/cosmos-reason2-2b:1208-fp8-static-kv8"
```

This creates a directory called `cosmos-reason2-2b_v1208-fp8-static-kv8/` containing the model weights.

### Cosmos Reason2 8B (AGX Thor / AGX Orin only)

```bash
cd ~/Projects/CosmosReason2
ngc registry model download-version "nim/nvidia/cosmos-reason2-8b:1208-fp8-static-kv8"
```

This creates a directory called `cosmos-reason2-8b_v1208-fp8-static-kv8/`. The 8B model provides stronger reasoning capabilities but requires more memory — it is **not supported** on Orin Super Nano.

Note the full path of the model you downloaded — you will mount it into the Docker container as a volume.


## Step 3: Pull the vLLM Docker Image

### For Jetson AGX Thor

```bash
docker pull ghcr.io/nvidia-ai-iot/vllm:latest-jetson-thor
```

### For Jetson AGX Orin / Orin Super Nano

```bash
docker pull ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin
```


## Step 4: Serve Cosmos Reason2 with vLLM

Select your Jetson device below for device-specific instructions:

<div class="device-tabs">
<div class="device-tab-bar">
<button class="device-tab active" data-target="thor">AGX Thor</button>
<button class="device-tab" data-target="orin">AGX Orin</button>
<button class="device-tab" data-target="nano">Orin Super Nano (2B only)</button>
</div>
<div class="device-panel" data-panel="thor">

Thor has ample GPU memory and can run either the 2B or 8B model with generous context length.

**Set the model path and free cached memory:**

```bash
# For the 2B model:
MODEL_PATH="$HOME/Projects/CosmosReason2/cosmos-reason2-2b_v1208-fp8-static-kv8"

# Or for the 8B model:
# MODEL_PATH="$HOME/Projects/CosmosReason2/cosmos-reason2-8b_v1208-fp8-static-kv8"

sudo sysctl -w vm.drop_caches=3
```

**1. Launch the container:**

```bash
docker run --rm -it \
  --runtime nvidia \
  --network host \
  --shm-size=8g \
  --ulimit memlock=-1 \
  --ulimit stack=67108864 \
  -v "$MODEL_PATH:/models/cosmos-reason2:ro" \
  -e NVIDIA_VISIBLE_DEVICES=all \
  -e NVIDIA_DRIVER_CAPABILITIES=compute,utility \
  ghcr.io/nvidia-ai-iot/vllm:latest-jetson-thor \
  bash
```

**2. Inside the container, activate the environment and serve:**

```bash
cd /opt/
source venv/bin/activate

vllm serve /models/cosmos-reason2 \
  --max-model-len 8192 \
  --media-io-kwargs '{"video": {"num_frames": -1}}' \
  --reasoning-parser qwen3 \
  --gpu-memory-utilization 0.8
```

> **Note:** The `--reasoning-parser qwen3` flag enables chain-of-thought reasoning extraction. The `--media-io-kwargs` flag configures video frame handling.

Wait until you see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

</div>
<div class="device-panel" data-panel="orin" style="display:none">

AGX Orin can run either the 2B or 8B model with the same parameters as Thor.

**Set the model path and free cached memory:**

```bash
# For the 2B model:
MODEL_PATH="$HOME/Projects/CosmosReason2/cosmos-reason2-2b_v1208-fp8-static-kv8"

# Or for the 8B model:
# MODEL_PATH="$HOME/Projects/CosmosReason2/cosmos-reason2-8b_v1208-fp8-static-kv8"

sudo sysctl -w vm.drop_caches=3
```

**1. Launch the container:**

```bash
docker run --rm -it \
  --runtime nvidia \
  --network host \
  --shm-size=8g \
  --ulimit memlock=-1 \
  --ulimit stack=67108864 \
  -v "$MODEL_PATH:/models/cosmos-reason2:ro" \
  -e NVIDIA_VISIBLE_DEVICES=all \
  -e NVIDIA_DRIVER_CAPABILITIES=compute,utility \
  ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin \
  bash
```

**2. Inside the container, activate the environment and serve:**

```bash
cd /opt/
source venv/bin/activate

vllm serve /models/cosmos-reason2 \
  --max-model-len 8192 \
  --media-io-kwargs '{"video": {"num_frames": -1}}' \
  --reasoning-parser qwen3 \
  --gpu-memory-utilization 0.8
```

Wait until you see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

</div>
<div class="device-panel" data-panel="nano" style="display:none">

The Orin Super Nano has significantly less RAM, so we need aggressive memory optimization including reducing the model's default image resolution. Only the **2B model** is supported on this device.

**1. Reduce the model's image resolution config:**

The default `preprocessor_config.json` allows images up to 16M pixels, which produces too many tokens for the Orin Super Nano's limited context window. Reduce it on the host before launching Docker:

```bash
cd ~/Projects/CosmosReason2/cosmos-reason2-2b_v1208-fp8-static-kv8
cp preprocessor_config.json preprocessor_config.json.bak

python3 -c "
import json
with open('preprocessor_config.json') as f:
    cfg = json.load(f)
print(f'Old longest_edge: {cfg[\"size\"][\"longest_edge\"]}')
print(f'Old shortest_edge: {cfg[\"size\"][\"shortest_edge\"]}')
cfg['size']['longest_edge'] = 50176
cfg['size']['shortest_edge'] = 3136
with open('preprocessor_config.json', 'w') as f:
    json.dump(cfg, f, indent=2)
print('New longest_edge: 50176')
print('New shortest_edge: 3136')
"
```

This limits input images to ~50K pixels, keeping image tokens small enough to fit in the constrained context window.

**2. Set the model path and free cached memory:**

```bash
MODEL_PATH="$HOME/Projects/CosmosReason2/cosmos-reason2-2b_v1208-fp8-static-kv8"
sudo sysctl -w vm.drop_caches=3
```

**3. Launch the container:**

```bash
docker run --rm -it \
  --runtime nvidia \
  --network host \
  -v "$MODEL_PATH:/models/cosmos-reason2:ro" \
  -e NVIDIA_VISIBLE_DEVICES=all \
  -e NVIDIA_DRIVER_CAPABILITIES=compute,utility \
  ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin \
  bash
```

**4. Inside the container, activate the environment and serve:**

```bash
cd /opt/
source venv/bin/activate

vllm serve /models/cosmos-reason2 \
  --host 0.0.0.0 \
  --port 8000 \
  --trust-remote-code \
  --enforce-eager \
  --max-model-len 768 \
  --max-num-batched-tokens 768 \
  --gpu-memory-utilization 0.52 \
  --max-num-seqs 1 \
  --enable-chunked-prefill \
  --limit-mm-per-prompt '{"image":1}'
```

**Key flags explained (Orin Super Nano only):**

| Flag | Purpose |
|---|---|
| `--enforce-eager` | Disables CUDA graphs to save memory |
| `--max-model-len 768` | Context window sized for image tokens + output |
| `--max-num-batched-tokens 768` | Matches the model length limit |
| `--gpu-memory-utilization 0.52` | Uses most available memory (~3.9 GiB free of 7.4 GiB) |
| `--max-num-seqs 1` | Single request at a time to minimize memory |
| `--enable-chunked-prefill` | Processes prefill in chunks for memory efficiency |
| `--limit-mm-per-prompt` | Limits to 1 image per prompt |

Wait until you see the server is ready:

```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

</div>
</div>

### Verify the server is running

From another terminal on the Jetson:

```bash
curl http://localhost:8000/v1/models
```

You should see the model listed in the response.


## Step 5: Test with a Quick API Call

Before connecting the WebUI, verify the model responds correctly with a vision request. First, download a sample image:

```bash
wget -q -O sample.jpg https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg
```

Then send a vision request:

```bash
curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "/models/cosmos-reason2",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "image_url", "image_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg"}},
          {"type": "text", "text": "Describe what you see in this image."}
        ]
      }
    ],
    "max_tokens": 256
  }' | python3 -m json.tool
```

You should see a response with chain-of-thought reasoning followed by a description of the image.

> **Tip:** The model name used in the API request must match what vLLM reports. Verify with `curl http://localhost:8000/v1/models`.


## Step 6: Connect to Live VLM WebUI

[Live VLM WebUI](https://github.com/NVIDIA-AI-IOT/live-vlm-webui) provides a real-time webcam-to-VLM interface. With vLLM serving Cosmos Reason2, you can stream your webcam and get live AI analysis with reasoning.

### Install Live VLM WebUI

The easiest method is pip (Open another terminal):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
cd ~/Projects/CosmosReason2
uv venv .live-vlm --python 3.12
source .live-vlm/bin/activate
uv pip install live-vlm-webui
live-vlm-webui
```

Or use Docker:

```bash
git clone https://github.com/nvidia-ai-iot/live-vlm-webui.git
cd live-vlm-webui
./scripts/start_container.sh
```

### Configure the WebUI

1. Open **`https://localhost:8090`** in your browser
2. Accept the self-signed certificate (click **Advanced** → **Proceed**)
3. In the **VLM API Configuration** section on the left sidebar:
   - Set **API Base URL** to `http://localhost:8000/v1`
   - Click the **Refresh** button to detect the model
   - Select the Cosmos Reason2 model from the dropdown
4. Select your camera and click **Start**

The WebUI will now stream your webcam frames to Cosmos Reason2 and display the model's analysis in real-time.

### Required WebUI settings for Orin Super Nano

> **Important:** On Orin Super Nano, vLLM is configured with `--max-model-len 768`. The WebUI defaults to `max_tokens: 512`, which will cause requests to fail with a `400 Bad Request` error since image tokens consume most of the context window. You **must** lower Max Tokens before starting analysis.

In the WebUI left sidebar, adjust these settings **before clicking Start**:

- **Max Tokens**: Set to **150** (image tokens use ~500-600 of the 768 context, leaving ~150-200 for output)
- **Frame Processing Interval**: Set to **60+** (gives the model time between frames)
- Use **short prompts** — longer prompts consume more input tokens, leaving fewer for the response


## Troubleshooting

1. **Out of memory on Orin** — vLLM crashes with CUDA out-of-memory errors. Free system memory first with `sudo sysctl -w vm.drop_caches=3`, lower `--gpu-memory-utilization` (try `0.45` or `0.40`), reduce `--max-model-len` (try `128`), ensure no other GPU-intensive processes are running, or switch from the 8B to the 2B model.

2. **"max_tokens is too large" errors on Orin Super Nano** — vLLM returns `400 Bad Request` because image tokens consume most of the 768 token context window (~500-600 tokens for a single image). In the WebUI, set **Max Tokens** to **150** before starting analysis. Make sure you edited `preprocessor_config.json` to reduce `longest_edge` to `50176` (Step 4, Orin Super Nano tab).

3. **Model not found in WebUI** — The model doesn't appear in the Live VLM WebUI dropdown. Verify vLLM is running with `curl http://localhost:8000/v1/models`. Ensure the WebUI API Base URL is set to `http://localhost:8000/v1` (not `https`). If vLLM and WebUI are in separate containers, use `http://<jetson-ip>:8000/v1` instead of `localhost`.

4. **Slow inference on Orin** — This is expected with the memory-constrained configuration. The 2B FP8 model on Orin Super Nano prioritizes fitting in memory over speed. On AGX Orin, switching from the 8B to the 2B model will improve latency. Reduce `max_tokens` in the WebUI for shorter, faster responses, or increase the frame interval so the model isn't constantly processing new frames.

5. **vLLM fails to load model** — vLLM reports the model path doesn't exist or can't be loaded. Verify the NGC download completed successfully (e.g., `ls ~/Projects/CosmosReason2/cosmos-reason2-2b_v1208-fp8-static-kv8/`). Make sure the volume mount path is correct in your `docker run` command and the model directory is mounted as read-only (`:ro`) with the container path matching what you pass to `vllm serve`.

---

## Additional Resources

- **Model Pages**: [Cosmos Reason2 2B](/models/cosmos-reason2-2b) · [Cosmos Reason2 8B](/models/cosmos-reason2-8b) · [Cosmos Reason1 7B](/models/cosmos-reason1-7b) — quick-start commands, llama.cpp support, and benchmarks
- **Cosmos Reason2 2B**: [https://huggingface.co/nvidia/Cosmos-Reason2-2B](https://huggingface.co/nvidia/Cosmos-Reason2-2B)
- **Cosmos Reason2 8B**: [https://huggingface.co/nvidia/Cosmos-Reason2-8B](https://huggingface.co/nvidia/Cosmos-Reason2-8B)
- **NGC Model Catalog**: [https://catalog.ngc.nvidia.com/](https://catalog.ngc.nvidia.com/)
- **Live VLM WebUI**: [https://github.com/NVIDIA-AI-IOT/live-vlm-webui](https://github.com/NVIDIA-AI-IOT/live-vlm-webui)

