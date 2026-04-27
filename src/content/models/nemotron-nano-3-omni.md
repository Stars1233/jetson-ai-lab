---
title: "Nemotron Nano 3 Omni"
model_id: "nemotron-nano-3-omni"
short_description: "NVIDIA's multimodal reasoning model with language, vision, audio, and video understanding — 30B total / 3B active MoE, available in NVFP4, FP8, and BF16."
family: "NVIDIA Nemotron"
icon: "⚡"
is_new: true
order: 4
type: "Multimodal"
vision_capable: true
memory_requirements: "64GB RAM"
precision: "NVFP4 / FP8 / BF16"
parameters: "30B total / 3B active"
modalities: ["Text", "Image", "Audio", "Video"]
context_length: "32K"
license: "NVIDIA Open Model License"
model_size: "21GB"
hf_checkpoint: "nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4"
huggingface_url: "https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4"
minimum_jetson: "Orin AGX"
supported_inference_engines:
  - engine: "vLLM"
    type: "Container"
    modules_supported:
      - thor_t5000
      - thor_t4000
      - orin_agx_64
    serve_command_orin: |-
      sudo docker run -it --rm --pull always \
        --runtime=nvidia --network host \
        -v $HOME/.cache/huggingface:/root/.cache/huggingface \
        ghcr.io/nvidia-ai-iot/vllm:latest-jetson-orin \
        bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8 \
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
        bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 \
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

Nemotron Nano 3 Omni is NVIDIA's multimodal reasoning model combining language, vision, audio, and video understanding. It uses a Mixture-of-Experts architecture with 30B total parameters and 3B active per forward pass, delivering strong multimodal reasoning with efficient inference on Jetson Thor and Orin platforms.

## Inputs and Outputs

**Input:** Text, image, audio, and video

**Output:** Text

## Intended Use Cases

- **Multimodal Assistants**: Answering questions about images, audio clips, and video segments
- **Voice and Vision Interfaces**: Edge AI applications combining speech and visual understanding
- **Agentic Workflows**: Function calling with chain-of-thought reasoning for autonomous task execution
- **Document Understanding**: OCR, chart analysis, and visual document Q&A
- **Audio Transcription and Analysis**: Processing short audio clips with context awareness

## Supported Platforms

- Jetson Thor (NVFP4, FP8, BF16)
- Jetson Orin AGX 64GB (FP8, BF16)

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
  bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8 \
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
  bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 \
    --trust-remote-code \
    --gpu-memory-utilization 0.65 \
    --max-model-len 32768 \
    --reasoning-parser nemotron_v3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder"
```

</div>
</div>
