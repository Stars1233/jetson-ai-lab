---
title: "Nemotron 3 Nano Omni"
model_id: "nemotron-3-nano-omni"
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
hf_checkpoint: "nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4"
huggingface_url: "https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4"
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
        bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8 \
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
        bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 \
          --trust-remote-code \
          --gpu-memory-utilization 0.65 \
          --max-model-len 32768 \
          --reasoning-parser nemotron_v3 \
          --enable-auto-tool-choice \
          --tool-call-parser qwen3_coder"
  - engine: "SGLang"
    type: "Container"
    modules_supported:
      - thor_t5000
      - thor_t4000
    serve_command_thor: |-
      sudo docker run -it --rm --pull always \
        --runtime=nvidia --network host \
        --shm-size 16g \
        -v $HOME/.cache/huggingface:/root/.cache/huggingface \
        --entrypoint bash \
        lmsysorg/sglang:latest \
        -c "pip install -q librosa && sglang serve nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 \
          --trust-remote-code \
          --mem-fraction-static 0.80 \
          --max-running-requests 8 \
          --reasoning-parser nemotron_3 \
          --tool-call-parser qwen3_coder \
          --disable-cuda-graph"
  - engine: "llama.cpp"
    type: "Container"
    modules_supported:
      - thor_t5000
      - thor_t4000
      - orin_agx_64
    serve_command_orin: |-
      sudo docker run -it --rm --pull always \
        --runtime=nvidia --network host \
        -v /home/nvidia/models/nemotron-omni:/models \
        ghcr.io/adsahu-nv/llama_cpp:b8917-r38.2.arm64-sbsa-cu130-24.04 \
        llama-server \
          -m /models/Nemotron-3-Nano-Omni-30B-A3B-GA-Q4_K_M.gguf \
          -mm /models/mmproj.gguf \
          --host 0.0.0.0 \
          --port 8080 \
          -c 8192 \
          -ngl 999 \
          --alias my_model
    serve_command_thor: |-
      sudo docker run -it --rm --pull always \
        --runtime=nvidia --network host \
        -v /home/nvidia/models/nemotron-omni:/models \
        ghcr.io/adsahu-nv/llama_cpp:b8917-r38.2.arm64-sbsa-cu130-24.04 \
        llama-server \
          -m /models/Nemotron-3-Nano-Omni-30B-A3B-GA-Q4_K_M.gguf \
          -mm /models/mmproj.gguf \
          --host 0.0.0.0 \
          --port 8080 \
          -c 8192 \
          -ngl 999 \
          --alias my_model
benchmark_key: "Nemotron 3 Nano Omni"
benchmark_series:
  - "Nemotron 3 30B-A3B"
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
  bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8 \
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
  bash -c "pip install -q 'vllm[audio]' && vllm serve nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 \
    --trust-remote-code \
    --gpu-memory-utilization 0.65 \
    --max-model-len 32768 \
    --reasoning-parser nemotron_v3 \
    --enable-auto-tool-choice \
    --tool-call-parser qwen3_coder"
```

</div>
</div>

## Running with SGLang

<div class="device-tabs">
<div class="device-tab-bar">
<button class="device-tab active" data-target="thor-sglang">Jetson Thor</button>
</div>
<div class="device-panel" data-panel="thor-sglang">

```bash
sudo docker run -it --rm --pull always \
  --runtime=nvidia --network host \
  --shm-size 16g \
  -v $HOME/.cache/huggingface:/root/.cache/huggingface \
  --entrypoint bash \
  lmsysorg/sglang:latest \
  -c "pip install -q librosa && sglang serve nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4 \
    --trust-remote-code \
    --mem-fraction-static 0.80 \
    --max-running-requests 8 \
    --reasoning-parser nemotron_3 \
    --tool-call-parser qwen3_coder \
    --disable-cuda-graph"
```

> **Note:** SGLang uses `--reasoning-parser nemotron_3` (distinct from vLLM's `nemotron_v3`). `--disable-cuda-graph` is required for this model. `librosa` is installed at runtime for audio encoder support.

</div>
</div>

Once the server is running, query it with:

```bash
curl -s http://${JETSON_HOST}:30000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## Running with llama.cpp

<div class="device-tabs">
<div class="device-tab-bar">
<button class="device-tab active" data-target="orin-llama">Jetson Orin</button>
<button class="device-tab" data-target="thor-llama">Jetson Thor</button>
</div>
<div class="device-panel" data-panel="orin-llama">

```bash
sudo docker run -it --rm --pull always \
  --runtime=nvidia --network host \
  -v /home/nvidia/models/nemotron-omni:/models \
  ghcr.io/adsahu-nv/llama_cpp:b8917-r38.2.arm64-sbsa-cu130-24.04 \
  llama-server \
    -m /models/Nemotron-3-Nano-Omni-30B-A3B-GA-Q4_K_M.gguf \
    -mm /models/mmproj.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -c 8192 \
    -ngl 999 \
    --alias my_model
```

</div>
<div class="device-panel hidden" data-panel="thor-llama">

```bash
sudo docker run -it --rm --pull always \
  --runtime=nvidia --network host \
  -v /home/nvidia/models/nemotron-omni:/models \
  ghcr.io/adsahu-nv/llama_cpp:b8917-r38.2.arm64-sbsa-cu130-24.04 \
  llama-server \
    -m /models/Nemotron-3-Nano-Omni-30B-A3B-GA-Q4_K_M.gguf \
    -mm /models/mmproj.gguf \
    --host 0.0.0.0 \
    --port 8080 \
    -c 8192 \
    -ngl 999 \
    --alias my_model
```

</div>
</div>

Once the server is running, query it with:

```bash
curl -s http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "my_model",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "max_tokens": 256,
    "chat_template_kwargs": {"enable_thinking": true}
  }'
```

> **Note:** `-mm /models/mmproj.gguf` loads the multimodal projector for vision support. `-ngl 999` offloads all layers to GPU. `--alias my_model` sets the model name used in API requests. `chat_template_kwargs: {"enable_thinking": true}` activates chain-of-thought reasoning.
