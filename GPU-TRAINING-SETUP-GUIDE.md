# Wayfinder SLM Training — GPU Setup Guide

## Your Hardware
- **GPU:** RTX 5060 Ti (8GB VRAM)
- **CPU:** Intel Core Ultra 7
- **RAM:** 32GB
- **Storage:** 2TB NVMe SSD

**Can you train locally?** Yes — but only with QLoRA (4-bit quantization). An 8B model needs ~6GB VRAM for QLoRA inference + training. You're right at the edge with 8GB. It WILL work for small batch sizes but will be slow (~8-12 hours for 3K pairs). For faster iteration and larger experiments, rent a cloud GPU.

---

## Recommended: RunPod (Easiest + Cheapest)

### Why RunPod
- No setup hassle — pre-built PyTorch containers with everything installed
- Pay by the hour (no minimums)
- Community Cloud = cheap spot instances
- Templates with Hugging Face, Axolotl, etc. pre-installed

### Step-by-Step Setup

**1. Create Account**
- Go to [runpod.io](https://runpod.io)
- Sign up with email
- Add credit card or crypto — deposit $25 to start (that's plenty for initial training)

**2. Choose a GPU Pod**

| GPU | VRAM | Cost/hr (Community) | Best For |
|-----|------|-------------------|----------|
| RTX 3090 | 24GB | ~$0.20/hr | QLoRA 8B (budget option) |
| RTX 4090 | 24GB | ~$0.35/hr | QLoRA 8B (fast) |
| A100 40GB | 40GB | ~$0.80/hr | Full LoRA or larger batches |
| A100 80GB | 80GB | ~$1.20/hr | Full fine-tune 8B (no quantization needed) |
| **H100 80GB** | **80GB** | **~$2.00/hr** | **Fastest — 3K pairs in ~1 hour** |

**Recommendation:** Start with an **RTX 4090** ($0.35/hr) for QLoRA. A full 3K-pair training run will cost ~$1-2. If you want speed, jump to A100.

**3. Launch a Pod**
- Click "Deploy" → "GPU Cloud"
- Select your GPU
- Template: **RunPod PyTorch 2.x** (has CUDA, PyTorch pre-installed)
- Disk: 50GB container + 50GB volume (for model weights)
- Click "Deploy"
- Wait 1-2 minutes for pod to start

**4. Connect**
- Click "Connect" → "Start Web Terminal" (or SSH)
- You're now in a Linux terminal with GPU access

**5. Install Training Stack**
```bash
# Install Axolotl (best tool for LLaMA fine-tuning)
pip install axolotl[flash-attn]

# OR install Unsloth (faster, simpler)
pip install unsloth

# Verify GPU
python -c "import torch; print(torch.cuda.get_device_name(0))"
```

**6. Upload Your Training Data**
- Use the RunPod file manager (web UI) to upload your training JSONL
- Or use SCP: `scp training_data.jsonl root@<pod-ip>:/workspace/`

**7. Run Training** (example with Axolotl)
```bash
# Pull base model
axolotl fetch meta-llama/Meta-Llama-3.1-8B

# Run fine-tuning with your config
axolotl train wayfinder-config.yml
```

**8. Download Your Model**
- After training, download the adapter weights (small, ~100-500MB)
- Or merge into full model and download (~16GB for 8B)

**9. Stop the Pod**
- CRITICAL: Stop the pod when done — you're billed per hour
- Your volume persists between sessions (so you don't re-download the base model)

---

## Alternative: Local Training on Your 5060 Ti

If you want to train locally (free but slower):

### Setup
```bash
# Install Miniconda
# Download from: https://docs.conda.io/en/latest/miniconda.html

# Create environment
conda create -n wayfinder python=3.11
conda activate wayfinder

# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Install Unsloth (optimized for consumer GPUs)
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"

# Verify
python -c "import torch; print(torch.cuda.get_device_name(0)); print(f'VRAM: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f}GB')"
```

### Training Config for 8GB VRAM
```python
# Use Unsloth for 4-bit QLoRA (fits in 8GB)
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Meta-Llama-3.1-8B-bnb-4bit",  # 4-bit quantized
    max_seq_length=2048,
    load_in_4bit=True,
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,                    # LoRA rank
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                     "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",  # Saves VRAM
)
```

---

## Base Model Options

| Model | Size | Why |
|-------|------|-----|
| **Meta-Llama-3.1-8B** | 8B | Best overall for instruction fine-tuning. Strong reasoning. |
| **Meta-Llama-3.1-8B-Instruct** | 8B | Already instruction-tuned — fine-tune on top for domain specificity |
| **Mistral-7B-v0.3** | 7B | Slightly smaller, fast inference, good for career SLM |
| **Qwen2.5-7B** | 7B | Strong multilingual — good if serving international students |

**Recommendation:** Start with **Llama 3.1 8B Instruct** for both SLMs. It already knows how to have conversations — you're teaching it domain expertise.

---

## Training Data Format

Your training pairs should be in this format (JSONL):

```json
{"conversations": [{"role": "system", "content": "You are Wayfinder, an elite college admissions consultant..."}, {"role": "user", "content": "My daughter is a junior with a 3.8 GPA and wants to apply to Duke. What should her essay strategy be?"}, {"role": "assistant", "content": "Duke values intellectual curiosity and community engagement..."}]}
```

---

## Cost Estimate for Full Training

| Scenario | GPU | Time | Cost |
|----------|-----|------|------|
| Admissions SLM (3K pairs, QLoRA) | RTX 4090 | ~3 hrs | ~$1.05 |
| Career SLM (2K pairs, QLoRA) | RTX 4090 | ~2 hrs | ~$0.70 |
| Both SLMs with experimentation | RTX 4090 | ~10 hrs | ~$3.50 |
| Same on A100 (faster) | A100 40GB | ~4 hrs total | ~$3.20 |
| Full fine-tune (no LoRA) | A100 80GB | ~6 hrs total | ~$7.20 |

**Total budget: $5-10 for both SLMs.** Not a typo.

---

## After Training: Deployment

Once trained, you have options:
1. **Self-host on your 5060 Ti** — run inference locally with Ollama or vLLM
2. **Deploy on RunPod Serverless** — pay per request, scales to zero
3. **Deploy on your Render server** — if you add a GPU instance
4. **Use Together.ai or Fireworks.ai** — upload custom model, pay per token

For Wayfinder v1, self-hosting on your 5060 Ti with Ollama is the simplest path. You can serve both SLMs locally and have your Node.js backend call them instead of Claude for subscribed users.
