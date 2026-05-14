---
title: "OpenPi π₀.₅ on Jetson Thor"
description: "Deploy Physical Intelligence's OpenPi π₀.₅ Vision-Language-Action (VLA) model on NVIDIA Jetson AGX Thor with TensorRT NVFP4 quantization for low-latency end-to-end inference."
category: "VLA"
section: "Vision-Language-Action Models"
order: 1
tags: ["vla", "openpi", "pi0.5", "robotics", "jetson-thor", "tensorrt", "nvfp4", "fp8", "inference", "vision-language-action"]
authors:
  - name: "Aditya Sahu"
    github: "adsahu-nv"
---

Deploy [Physical Intelligence's](https://www.physicalintelligence.company/) OpenPi **π₀.₅ Vision-Language-Action (VLA)** model on **NVIDIA Jetson AGX Thor** with TensorRT NVFP4 quantization for low-latency end-to-end inference.


## What is OpenPi π₀.₅?

[OpenPi](https://github.com/Physical-Intelligence/openpi) is Physical Intelligence's open-source robotics model repository. The **π₀.₅** model is a flow-matching Vision-Language-Action (VLA) model pre-trained on 10,000+ hours of robot data. It takes camera images and a natural-language instruction as input and outputs robot actions — enabling language-conditioned robotic manipulation.

![OpenPi Image](/images/tutorials/pi_05.png)


## Why Jetson AGX Thor? 

VLA models are computationally demanding,  they fuse vision encoders, language models  and action decoders into a single pipeline that must run at real-time control rates. Jetson AGX Thor brings Blackwell-class GPU compute with up to 128GB of unified memory, giving it the headroom to run these large multimodal models entirely on-device. Combined with TensorRT acceleration and FP8/NVFP4 precision support, Thor can deliver the throughput needed for closed-loop robotic control without relying on a separate GPU server.

![π₀.₅ E2E Pipeline Latency on Jetson AGX Thor](/images/tutorials/pi05-thor-perf.png)

## Pipeline Overview

```
JAX Checkpoint ──► PyTorch ──► ONNX (FP8 + NVFP4) ──► TensorRT Engine ──► Inference
```

| Stage | What happens |
|---|---|
| **1. JAX → PyTorch** | Convert original JAX/Flax weights to PyTorch SafeTensors |
| **2. PyTorch → ONNX** | Export with FP8/NVFP4 quantization via NVIDIA ModelOpt |
| **3. ONNX → TensorRT** | Compile optimized engine with `trtexec` |
| **4. Inference** | Run the TensorRT engine for low-latency inference |

## Performance

Benchmarked on Jetson AGX Thor Developer Kit (JetPack 7.x, MAXN power mode):

| Inference Backend | Total Latency (ms) | Model Latency (ms) | Speedup |
|---|---|---|---|
| PyTorch BF16 | ~163 | ~158 | 1.0x |
| TensorRT FP8 | ~95 | ~91 | 1.71x |
| **TensorRT FP8 + NVFP4** | **~94** | **~90** | **1.73x** |

## Prerequisites

### Hardware

- **NVIDIA Jetson AGX Thor** Developer Kit
- NVMe SSD recommended (model weights are ~6 GB+)

### Software

| Component | Required Version |
|---|---|
| JetPack | 7.x (L4T R38.x) — tested with JP 7.0 and 7.1 |
| CUDA | 13.0 |
| Docker | 28.x+ |
| NVIDIA Container Toolkit | 1.18+ |

> **Check your setup:**
> ```bash
> cat /etc/nv_tegra_release   # Should show R38
> nvidia-smi                   # Should show CUDA 13.0, Thor GPU
> docker --version             # Docker 28.x
> dpkg-query -W nvidia-container-toolkit
> ```


## Step 1: Set Jetson to Maximum Performance

Boost all clocks and disable GPU power gating for consistent benchmark results.

```bash
# Set maximum performance power mode
sudo nvpmodel -m 0

# Lock all clocks to maximum frequency
sudo jetson_clocks

# Disable GPU railgate
sudo sh -c 'echo on > /sys/bus/pci/devices/0000:01:00.0/power/control'
```

Verify with:

```bash
sudo jetson_clocks --show
```


## Step 2: Clone the OpenPi Repository

The deployment scripts in this tutorial were tested against a specific commit of the OpenPi repo. Pin to that commit for reproducibility:

```bash
git clone --recurse-submodules https://github.com/Physical-Intelligence/openpi.git
cd openpi
git checkout 175f89c3
```

> **Tip:** You can try the latest `main` branch (`git checkout main`) if you want the newest features, but if something breaks during conversion or export, fall back to the pinned commit above.


## Step 3: Download Jetson Thor Deployment Scripts

The OpenPi repo does not include the Jetson Thor deployment scripts by default. Download them into the cloned repo:

```bash
wget -qO- https://www.jetson-ai-lab.com/code-samples/openpi_on_thor/download.sh | bash
```

This downloads the Dockerfile, inference scripts, ONNX export tools, and TensorRT engine builder into the `openpi_on_thor/` folder.

Verify:

```bash
ls openpi_on_thor/
# thor.Dockerfile  pyproject.toml  pi05_inference.py  pytorch_to_onnx.py
# build_engine.sh  trt_model_forward.py  trt_torch.py  calibration_data.py
# patches/apply_gemma_fixes.py
```


## Step 4: Build the Docker Image for Jetson Thor

The Dockerfile at `openpi_on_thor/thor.Dockerfile` uses the [NVIDIA PyTorch container](https://catalog.ngc.nvidia.com/orgs/nvidia/containers/pytorch) as the base and installs all dependencies from the [Jetson AI Lab pip index](https://pypi.jetson-ai-lab.io).

```bash
sudo docker build -t openpi-pi0.5:latest -f openpi_on_thor/thor.Dockerfile .
```

> **Note:** The first build takes 15–20 minutes. Subsequent builds use Docker cache and are much faster.

<details>
<summary><strong>What the Dockerfile does (click to expand)</strong></summary>

- **Base image:** `nvcr.io/nvidia/pytorch:25.09-py3` (PyTorch + CUDA + TensorRT + ModelOpt pre-installed)
- **Pip index:** `https://pypi.jetson-ai-lab.io/sbsa/cu130` (precompiled aarch64 wheels)
- **Installs:** OpenPi with `[thor]` extras — includes `onnx`, `onnxruntime`, `onnx_graphsurgeon`, `nvtx`, `torchcodec`, `diffusers`, and more
- **Extra deps:** `chex`, `toolz` (installed with `--no-deps` to avoid JAX/NumPy conflicts), `onnxslim` (for ONNX optimization), `lerobot` (pinned to a specific commit for API compatibility)
- **System packages:** ffmpeg, OpenCV dependencies, build tools

</details>


## Step 5: Launch the Docker Container

```bash
sudo docker run --rm -it --runtime nvidia \
  -v "$PWD":/workspace \
  -v "$HOME/.cache/openpi":/root/.cache/openpi \
  -w /workspace \
  -p 8000:8000 \
  openpi-pi0.5:latest
```

> **Tip:** The `-v "$HOME/.cache/openpi":/root/.cache/openpi` mount persists downloaded checkpoints, converted models, and TensorRT engines across container restarts. Without it, you'd need to re-download and re-convert everything each time.

**You are now inside the container.** All remaining steps run inside this shell.


## Step 6: Configure the Environment (Inside Container)

### 6.1 Set PYTHONPATH

```bash
export PYTHONPATH=packages/openpi-client/src:src:.:$PYTHONPATH
```

### 6.2 Choose a Model Config

Pick the config name for your target robot/task. We'll use `pi05_libero` as the running example.

```bash
export CONFIG_NAME=pi05_libero
```

Available configs:

| Config Name | Robot Platform | Description |
|---|---|---|
| `pi05_libero` | LIBERO (sim) | Fine-tuned for LIBERO benchmark tasks |
| `pi05_droid` | DROID (Franka) | Fine-tuned on DROID dataset, good generalization |
| `pi05_aloha` | ALOHA | For bimanual ALOHA platforms |

### 6.3 Apply Transformers Library Patches

OpenPi requires patched versions of several HuggingFace Transformers files (for AdaRMS normalization, precision control, and KV cache behavior).

```bash
cp -r ./src/openpi/models_pytorch/transformers_replace/* \
  /usr/local/lib/python3.12/dist-packages/transformers/
```

### 6.4 Apply ONNX/TRT Compatibility Fixes

The upstream transformers patches need two small fixes for TensorRT NVFP4 export:

1. **`GemmaRMSNorm.extra_repr()`** — add a guard so ONNX tracing doesn't crash when the `weight` attribute is absent (adaptive-norm layers use `.dense` instead).
2. **`GemmaAttention.forward()`** — replace `reshape(*input_shape, -1)` with an explicit dimension (`num_attention_heads * head_dim`). Without this, all dimensions appear dynamic in the ONNX graph and TensorRT's FP4 block quantization fails.

```bash
python openpi_on_thor/patches/apply_gemma_fixes.py
```

Expected output:

```
Applying ONNX/TRT compatibility fixes to modeling_gemma.py...
  [1/2] Applied hasattr guard in GemmaRMSNorm.extra_repr()
  [2/2] Applied explicit reshape dimension in GemmaAttention.forward()
  Patched: /usr/local/lib/python3.12/dist-packages/transformers/models/gemma/modeling_gemma.py
Done.
```

## Step 7: Download the JAX Checkpoint

The model checkpoints are stored on Google Cloud Storage and are downloaded automatically. The download includes both the model parameters and normalization assets.

```bash
python -c "
import os
from openpi.shared import download
config_name = os.getenv('CONFIG_NAME')
checkpoint_dir = download.maybe_download(f'gs://openpi-assets/checkpoints/{config_name}')
print(f'Checkpoint downloaded to: {checkpoint_dir}')
"
```

The checkpoint will be cached at `~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}/`.


## Step 8: Convert JAX Checkpoint to PyTorch

Convert the original JAX/Flax checkpoint to PyTorch SafeTensors format:

```bash
python examples/convert_jax_model_to_pytorch.py \
  --config-name ${CONFIG_NAME} \
  --checkpoint-dir ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME} \
  --output-path ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch
```

> **Important:** `--output-path` must be a **directory** path, not a file path. The script creates `model.safetensors` and `config.json` inside it automatically.

This takes ~5–10 minutes. When complete, you'll see:

```
Model conversion completed successfully!
Model saved to /root/.cache/openpi/openpi-assets/checkpoints/pi05_libero_pytorch
```

**Copy the normalization assets** into the PyTorch checkpoint directory (the conversion script does not copy them automatically):

```bash
cp -r ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}/assets \
  ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/
```

The output directory now contains:
- `model.safetensors` — PyTorch weights
- `config.json` — model architecture metadata
- `assets/` — normalization stats (needed for inference)


## Step 9: (Optional) Verify PyTorch Inference

Before quantizing, confirm the PyTorch model works correctly:

```bash
python openpi_on_thor/pi05_inference.py \
  --config-name ${CONFIG_NAME} \
  --checkpoint-dir ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch \
  --inference-mode pytorch \
  --num-warmup 3 \
  --num-test-runs 5
```

Expected output (~163 ms per inference on Thor, MAXN mode):

```
============================================================
Results:
============================================================
Actions shape: (10, 7)
Actions range: [-0.4826, 0.9994]
Total inference time: 162.64 ± 0.37 ms
    (min: 162.34, max: 163.32)
Model inference time: 157.94 ± 0.35 ms
    (min: 157.63, max: 158.60)
```


## Step 10: Export to ONNX with NVFP4 Quantization

This step converts the PyTorch model to ONNX format with **FP8 + NVFP4** quantization using [NVIDIA ModelOpt](https://github.com/NVIDIA/TensorRT-Model-Optimizer):

```bash
python openpi_on_thor/pytorch_to_onnx.py \
  --checkpoint_dir ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch \
  --output_path ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch \
  --config_name ${CONFIG_NAME} \
  --precision fp8 \
  --enable_llm_nvfp4 \
  --quantize_attention_matmul
```

**What happens:**
1. Model is loaded and patched for TensorRT-compatible export
2. Calibration data is loaded (from the dataset) for FP8 quantization
3. Attention matmul operations get QDQ nodes inserted
4. LLM layers are quantized to NVFP4 precision and converted to 2DQ format
5. ONNX model is exported with `dynamo=False` (legacy TorchScript tracer), dynamic axes, and external data

The ONNX model is saved to:
```
~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/onnx/model_fp8_nvfp4.onnx
```

<details>
<summary><strong>Other precision options (click to expand)</strong></summary>

| Flag | Precision | Latency | Notes |
|---|---|---|---|
| `--precision fp8 --quantize_attention_matmul` | FP8 | ~95 ms | Good accuracy/speed tradeoff |
| **`--precision fp8 --enable_llm_nvfp4 --quantize_attention_matmul`** | **FP8 + NVFP4** | **~94 ms** | **Recommended — best latency** |

> **Note:** Pure FP16 (`--precision fp16`) is not supported. The Pi0.5 model uses BF16 natively (8-bit exponent). FP16 has a much smaller dynamic range (5-bit exponent), causing overflow in the Gemma attention layers that compounds over the denoising loop.

</details>


## Step 11: Build TensorRT Engine

Compile the ONNX model into a TensorRT engine using `trtexec`:

```bash
ACTION_HORIZON=10 bash openpi_on_thor/build_engine.sh \
  ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/onnx/model_fp8_nvfp4.onnx \
  ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/engine/model_fp8_nvfp4.engine
```

> **Note:** `ACTION_HORIZON=10` matches the default for `pi05_libero`. Adjust if using a different config (check `config.model.action_horizon`).

This step takes **10–30 minutes** on Thor as `trtexec` optimizes the graph, selects kernels, and compiles CUDA code. The build log is saved alongside the engine file.

When complete:

```
TensorRT engine built successfully!
  Engine: ~/.cache/.../engine/model_fp8_nvfp4.engine
```


## Step 12: Run TensorRT NVFP4 Inference

Run the optimized TensorRT engine:

```bash
python openpi_on_thor/pi05_inference.py \
  --config-name ${CONFIG_NAME} \
  --checkpoint-dir ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch \
  --engine-path ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/engine/model_fp8_nvfp4.engine \
  --inference-mode tensorrt \
  --num-warmup 3 \
  --num-test-runs 10
```

**Expected output (~96 ms on Thor, MAXN mode):**

```
============================================================
Results:
============================================================
Actions shape: (10, 7)
Actions range: [-0.3147, 0.8649]
Total inference time: 96.42 ± 0.33 ms
    (min: 95.98, max: 96.91)
Model inference time: 91.99 ± 0.26 ms
    (min: 91.70, max: 92.54)
```

---

## Step 13: (Optional) Compare PyTorch vs TensorRT

The inference script has a built-in comparison mode that runs **both backends** with identical inputs and reports accuracy differences:

```bash
python openpi_on_thor/pi05_inference.py \
  --config-name ${CONFIG_NAME} \
  --checkpoint-dir ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch \
  --engine-path ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/engine/model_fp8_nvfp4.engine \
  --inference-mode compare \
  --num-warmup 3 \
  --num-test-runs 10
```

**Expected comparison output:**

```
Cosine Similarity:
  - Overall: 0.99557564
  - Per-timestep Mean: 0.99580561
  - Per-timestep Min:  0.99352367
  - Per-timestep Max:  0.99797150

Speedup:
  - Total: 1.71x
  - Model: 1.75x
```

Key metrics:
- **Cosine similarity** > 0.99 across all timesteps confirms the TRT engine faithfully reproduces PyTorch behavior
- **1.7× speedup** over PyTorch BF16 inference

---

## Step 14: (Optional) Launch Inference Server

For production robotics deployment, launch a WebSocket policy server that robots can query over the network:

```bash
python openpi_on_thor/serve_policy.py \
  --use-tensorrt \
  --tensorrt-engine ~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch/engine/model_fp8_nvfp4.engine \
  --port 8000 \
  policy:checkpoint \
  --policy.config=${CONFIG_NAME} \
  --policy.dir=~/.cache/openpi/openpi-assets/checkpoints/${CONFIG_NAME}_pytorch
```

> **Note:** This uses `openpi_on_thor/serve_policy.py` which extends OpenPi's `serve_policy.py` with TensorRT support. To serve without TensorRT (PyTorch only), omit `--use-tensorrt` and `--tensorrt-engine`.

The server listens on `0.0.0.0:8000` and accepts observations via WebSocket. A robot client can then query it:

```python
from openpi_client import websocket_client_policy

# Connect to the inference server running on Thor
policy = websocket_client_policy.WebsocketClientPolicy(
    host="<THOR_IP_ADDRESS>",
    port=8000,
)

# Send an observation and get actions back
action_chunk = policy.infer({
    "observation/image": camera_image,            # (224, 224, 3) uint8
    "observation/wrist_image": wrist_image,       # (224, 224, 3) uint8
    "observation/state": robot_state,             # (8,) float32
    "prompt": "pick up the red block",
})

actions = action_chunk["actions"]  # (10, 7) action trajectory
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `docker build` fails pulling base image | Ensure network access to `nvcr.io`. Try `docker login nvcr.io` |
| `trtexec` not found | It should be at `/usr/src/tensorrt/bin/trtexec` inside the container |
| TensorRT engine build OOM | Reduce `MAX_BATCH` to 1 in `build_engine.sh` |
| `fp16 precision has been set...but fp16 is not configured` | The `build_engine.sh` script needs `--fp16 --fp8` flags for `trtexec`. Ensure you're using the latest version. |
| ONNX export `GemmaRMSNorm` `AttributeError` | The `pytorch_to_onnx.py` script uses `dynamo=False` to avoid this. Ensure you're using the latest `openpi_on_thor/` scripts. |
| ONNX export fails | Ensure transformers patches were applied (Step 6.3) and `PYTHONPATH` is set (Step 6.1) |
| `ModuleNotFoundError: No module named 'openpi'` | `PYTHONPATH` is not set. Run Step 6.1: `export PYTHONPATH=packages/openpi-client/src:src:.:$PYTHONPATH` |
| `ModuleNotFoundError: No module named 'chex'` | Run `pip install chex --no-deps && pip install toolz --no-deps`. **Do NOT** omit `--no-deps` — it will upgrade jax/numpy and break the environment. The Dockerfile already includes this fix. |
| `No module named 'onnxslim'` | Run `pip install onnxslim` inside the container. The Dockerfile already includes this. |
| NVFP4 `TRT_FP4DynamicQuantize` blocked axis error | The Gemma attention reshape uses `-1` which makes dims appear dynamic. Run Step 6.4 (`apply_gemma_fixes.py`) to replace with explicit dims. |
| NVFP4 `TRT_FP4QDQ` / `fp4qdq_to_2dq` not found | ModelOpt in `26.01-py3` may lack `fp4qdq_to_2dq`. Use `25.09-py3` base image (default) which includes full NVFP4 support. |
| Checkpoint download fails | Check internet connectivity; GCS URLs require no auth for public checkpoints |
| GPU railgate re-enables after reboot | Re-run the `echo on > .../power/control` command after each boot |
| `ImportError: modelopt` | Ensure you're using the `[thor]` Docker image; `nvidia-modelopt` is pre-installed |
| Low cosine similarity (< 0.99) in compare mode | Ensure you built the engine with `--stronglyTyped` (the default `build_engine.sh` includes this) and are using the latest `pytorch_to_onnx.py` which performs denoising-loop accumulation in FP32. Re-export ONNX and rebuild the engine. |
| HuggingFace dataset download needs token | Set `export HF_TOKEN=<your_token>` if using `--use-dataset` flag |

---

## References

- [OpenPi GitHub Repository](https://github.com/Physical-Intelligence/openpi)
- [Physical Intelligence — π₀.₅ Blog Post](https://www.physicalintelligence.company/blog/pi05)
- [Physical Intelligence — FAST Tokenizer](https://www.physicalintelligence.company/research/fast)
- [NVIDIA TensorRT Documentation](https://docs.nvidia.com/deeplearning/tensorrt/)
- [NVIDIA ModelOpt (Quantization)](https://github.com/NVIDIA/TensorRT-Model-Optimizer)

