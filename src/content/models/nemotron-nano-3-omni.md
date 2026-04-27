---
title: "Nemotron Nano 3 Omni"
model_id: "nemotron-nano-3-omni"
short_description: "NVIDIA's compact multimodal model with language, vision, audio, and video understanding — delivered in NVFP4, FP8, and BF16 for Jetson Thor and Orin."
family: "NVIDIA Nemotron"
icon: "⚡"
is_new: true
order: 4
type: "Multimodal"
vision_capable: true
memory_requirements: "16GB RAM"
precision: "NVFP4 / FP8 / BF16"
parameters: "9B"
modalities: ["Text", "Image", "Audio", "Video"]
context_length: "32K"
license: "NVIDIA Open Model License"
model_size: "21GB"
hf_checkpoint: "nvidia/Nemotron-Nano-3-Omni-9B"
huggingface_url: "https://huggingface.co/nvidia/Nemotron-Nano-3-Omni-9B"
minimum_jetson: "Orin AGX"
# Optional: gray tabs via matrix_modules_disabled. Per-engine allowlists: supported_inference_engines[].modules_supported (from minimum_jetson).
supported_inference_engines:
  - engine: "vLLM"
    type: "Container"
    modules_supported:
      - thor_t5000
      - thor_t4000
      - orin_agx_64
      - orin_nx_16
    serve_command_orin: |-
      sudo docker run -it --rm --pull always \
        --runtime=nvidia --network host \
        -v $HOME/.cache/huggingface:/root/.cache/huggingface \
        ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin \
        bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-Nano-3-Omni-9B \
          --trust-remote-code \
          --gpu-memory-utilization 0.65 \
          --max-model-len 32768 \
          --reasoning-parser nemotron_v3 \
          --enable-auto-tool-choice \
          --tool-call-parser qwen3_coder"
    serve_command_thor: |-
      sudo docker run -it --rm --pull always \
        --runtime=nvidia --network host \
        -v $HOME/.cache/huggingface:/root/.cache/huggingface \
        vllm/vllm-openai:v0.20.0-ubuntu2404 \
        bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-Nano-3-Omni-9B-NVFP4 \
          --trust-remote-code \
          --gpu-memory-utilization 0.65 \
          --max-model-len 32768 \
          --reasoning-parser nemotron_v3 \
          --enable-auto-tool-choice \
          --tool-call-parser qwen3_coder"
benchmark_key: "Nemotron Nano 3 Omni"
benchmark_series:
  - "Nemotron Nano 9B V2"
  - "Nemotron Nano 12B VL"
---

Nemotron Nano 3 Omni is NVIDIA's compact multimodal model combining language, vision, audio, and video understanding in a single 9B parameter model. It delivers competitive multimodal reasoning at the edge across Jetson Thor and Orin platforms.

## Inputs and Outputs

**Input:** Text, image, audio, and video

**Output:** Text

## Intended Use Cases

- **Multimodal Assistants**: Answering questions about images, audio clips, and video segments
- **Voice and Vision Interfaces**: Edge AI applications combining speech and visual understanding
- **Agentic Workflows**: Function calling with reasoning for autonomous task execution
- **Document Understanding**: OCR, chart analysis, and visual document Q&A
- **Audio Transcription and Analysis**: Processing short audio clips with context awareness

## Supported Platforms

- Jetson Thor (NVFP4, FP8, BF16)
- Jetson Orin AGX 64GB (FP8, BF16)
- Jetson Orin NX 16GB (FP8)

## Running with vLLM

<div class="device-tabs">
<div class="device-tab-bar">
<button class="device-tab active" data-target="orin">Jetson Orin</button>
<button class="device-tab" data-target="thor">Jetson Thor</button>
</div>
<div class="device-panel" data-panel="orin">

```bash
sudo docker run -it --rm --pull always \
  --runtime=nvidia --network host \
  -v $HOME/.cache/huggingface:/root/.cache/huggingface \
  ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin \
  bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-Nano-3-Omni-9B \
    --trust-remote-code \
    --gpu-memory-utilization 0.65 \
    --max-model-len 32768 \
    --reasoning-parser nemotron_v3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder"
```

</div>
<div class="device-panel hidden" data-panel="thor">

```bash
sudo docker run -it --rm --pull always \
  --runtime=nvidia --network host \
  -v $HOME/.cache/huggingface:/root/.cache/huggingface \
  vllm/vllm-openai:v0.20.0-ubuntu2404 \
  bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-Nano-3-Omni-9B-NVFP4 \
    --trust-remote-code \
    --gpu-memory-utilization 0.65 \
    --max-model-len 32768 \
    --reasoning-parser nemotron_v3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder"
```

</div>
</div>
