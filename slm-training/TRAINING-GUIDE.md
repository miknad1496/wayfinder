# Wayfinder SLM Training Guide
## Fine-tuning Llama-3.1 8B for College Admissions Intelligence

---

## 1. GPU Rental Provider Comparison

For a QLoRA fine-tuning run on Llama-3.1 8B with 50K-100K training pairs:

| Provider | Cost (single run) | Ease of Use | Hosts Inference? | Best For |
|----------|-------------------|-------------|------------------|----------|
| **Together AI** | $5-15 (API-based) | Easiest — upload JSONL, click train | Yes (serverless) | **Recommended for first run** |
| **Fireworks AI** | $5-20 (API-based) | Easy — similar to Together | Yes (serverless) | Good alternative to Together |
| **RunPod** | $2-8 (spot A100) | Medium — need to set up environment | No (but can rent inference GPU) | Best price for hands-on users |
| **Lambda Labs** | $5-15 (hourly A100) | Medium — SSH into GPU server | No | Good for iterative experimentation |
| **Modal** | $3-10 (serverless) | Medium — Python SDK, code-first | Yes (serverless) | Best for automated pipelines |
| **Vast.ai** | $1-5 (marketplace) | Harder — variable quality, setup | No | Cheapest but least reliable |
| **Replicate** | $10-25 (API-based) | Easy — upload and train | Yes (serverless) | Simple but more expensive |

### Recommendation: Together AI for the first run

Together AI is the best starting point because:
- Upload a JSONL file, select the base model, click "Fine-tune"
- They handle all infrastructure (no Docker, no CUDA, no environment setup)
- After training, the model is immediately available as an inference endpoint
- Cost: ~$5-15 for 50K-100K pairs on Llama-3.1 8B
- Inference: ~$0.20 per 1M tokens (vs $15/M for Claude Opus)

### How to use Together AI fine-tuning:

```bash
# Install the CLI
pip install together

# Set API key
export TOGETHER_API_KEY="your-key-here"

# Upload training data
together files upload wayfinder-training.jsonl

# Start fine-tuning
together fine-tuning create \
  --training-file file-id-here \
  --model meta-llama/Meta-Llama-3.1-8B-Instruct \
  --n-epochs 3 \
  --learning-rate 2e-4 \
  --batch-size 4 \
  --lora \
  --lora-rank 64
```

---

## 2. Recommended Training Configuration

### Base Model
- **Model**: `meta-llama/Meta-Llama-3.1-8B-Instruct`
- **Why**: Best balance of size, capability, and fine-tuning ecosystem. The Instruct variant already understands conversation format.

### Training Method: QLoRA
- **Quantization**: 4-bit (NF4) — reduces memory from 32GB to ~6GB
- **LoRA rank**: 64 (higher = more capacity for domain knowledge, slight speed tradeoff)
- **LoRA alpha**: 128 (2x rank is standard)
- **Target modules**: `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`
- **Dropout**: 0.05

### Hyperparameters
- **Batch size**: 4 (with gradient accumulation steps: 4 → effective batch size 16)
- **Learning rate**: 2e-4 with cosine schedule and 3% warmup
- **Epochs**: 3 (monitor eval loss — stop if it starts rising)
- **Max sequence length**: 4096 tokens
- **Optimizer**: AdamW (8-bit via bitsandbytes)
- **Weight decay**: 0.01

### If training locally with Axolotl:

```yaml
# axolotl_config.yml
base_model: meta-llama/Meta-Llama-3.1-8B-Instruct
model_type: LlamaForCausalLM
load_in_4bit: true
adapter: qlora
lora_r: 64
lora_alpha: 128
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - gate_proj
  - up_proj
  - down_proj

datasets:
  - path: wayfinder-training.jsonl
    type: sharegpt

sequence_len: 4096
micro_batch_size: 4
gradient_accumulation_steps: 4
num_epochs: 3
learning_rate: 2e-4
lr_scheduler: cosine
warmup_ratio: 0.03
optimizer: adamw_bnb_8bit
weight_decay: 0.01
bf16: true
gradient_checkpointing: true

val_set_size: 0.1
eval_steps: 50
save_steps: 100
logging_steps: 10
```

```bash
# Install Axolotl
pip install axolotl[flash-attn]

# Run training
accelerate launch -m axolotl.cli.train axolotl_config.yml
```

---

## 3. Dataset Format Requirements

### JSONL Format (ChatML / ShareGPT style)

Each line is a JSON object with a "messages" array:

```jsonl
{"messages": [{"role": "system", "content": "You are Wayfinder, a college admissions intelligence and career strategy platform. You provide data-backed analysis using verified sources from IPEDS, BLS, O*NET, and NCES. You cite sources. You reason precisely. You never fabricate data."}, {"role": "user", "content": "What are my chances at UW CS as an out-of-state student with a 3.8 GPA and 1480 SAT?"}, {"role": "assistant", "content": "UW Computer Science is the most competitive program at the University of Washington, with a direct-admit acceptance rate of approximately 15% overall and roughly 8-10% for out-of-state applicants. Your 3.8 GPA is competitive but below the median for admitted CS students (typically 3.9+). Your 1480 SAT is within range but on the lower end.\n\nKey factors to consider:\n- UW uses a holistic review for CS direct admission, but GPA and math/science coursework carry heavy weight\n- Pre-major admission (starting undeclared and applying to CS later) has become increasingly difficult, with internal transfer rates around 25-30%\n- Consider applying to the Informatics program as a strategic alternative — it shares CS fundamentals but admits at roughly 2x the rate\n\nSource: UW Office of Admissions, IPEDS enrollment data"}]}
```

### System Prompt Template

```
You are Wayfinder, a college admissions intelligence and career strategy platform built on structured federal data and curated domain expertise. You provide precise, data-backed analysis sourced from IPEDS, BLS, O*NET, NCES College Scorecard, and a proprietary knowledge base distilled from admissions officers, institutional strategy guides, and career research. You cite your sources. You reason carefully about each student's specific situation. You never fabricate statistics or acceptance rates. When you don't have specific data, you say so clearly.
```

### Training Pair Categories

Generate pairs across these categories (target distribution):

| Category | % of Dataset | Example Query Types |
|----------|-------------|-------------------|
| **Admissions Strategy** | 25% | School selection, ED/EA strategy, school-within-school analysis |
| **School Profiles** | 20% | "Tell me about [school]", comparisons, program strengths |
| **Demographics/Data** | 10% | Ethnic composition, acceptance rates, enrollment stats |
| **Essay Intelligence** | 10% | Essay strategy, common mistakes, school-specific tips |
| **Career Intelligence** | 15% | Salary data, career paths, major ROI analysis |
| **WA State Specific** | 10% | WA schools, feeder patterns, local knowledge |
| **Consulting Differentiation** | 5% | Why Wayfinder vs consultants, methodology comparisons |
| **Multi-turn Reasoning** | 5% | Follow-up questions, nuanced scenarios |

### Quality Guidelines for Training Pairs

1. **Always cite sources** — "According to IPEDS data...", "BLS projects that..."
2. **Be specific** — Use actual numbers, not vague language
3. **Acknowledge uncertainty** — "Data suggests approximately..." not "The rate is exactly..."
4. **Show reasoning** — Walk through the logic, don't just state conclusions
5. **Avoid semicolons** — Part of the Wayfinder voice guidelines
6. **Be measured in tone** — Professional and thoughtful, not enthusiastic or salesy
7. **Include nuance** — "However, this varies significantly by..." not one-size-fits-all advice

---

## 4. Data Preparation Pipeline

### Step 1: Consolidate Raw Data

```bash
# All raw data is in slm-training/raw-data/
# - universities/ (3 batches + WA state)
# - high-schools/washington-state.json
# - consulting-firms/top-firms.json

# Existing knowledge base (already distilled):
# - backend/knowledge-base/distilled/*.md (48 files, 1.5MB)
# - backend/data/scraped/*.json (career data, internships, demographics, etc.)
```

### Step 2: Generate Training Pairs with Opus

This is the "distillation" step. We use Claude Opus to read our structured data and generate high-quality Q&A pairs.

```python
# generate_training_pairs.py
import json
import anthropic

client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are generating training data for a college admissions
intelligence AI called Wayfinder. Given a data profile for a school, generate
5-8 realistic question-answer pairs that a student or parent might ask.

The answers should:
- Use the data provided accurately
- Cite sources (IPEDS, BLS, etc.)
- Show reasoning and nuance
- Be 150-400 words each
- Never use semicolons
- Maintain a measured, professional tone

Output as JSON array of {"user": "...", "assistant": "..."} objects."""

def generate_pairs(profile_data, category):
    response = client.messages.create(
        model="claude-opus-4-20250514",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"Generate training pairs for this {category}:\n\n{json.dumps(profile_data, indent=2)}"
        }]
    )
    return json.loads(response.content[0].text)

# Process all university profiles
for batch_file in ["batch1-ivy-elite.json", "batch2-publics-lacs.json", "batch3-remaining.json"]:
    with open(f"slm-training/raw-data/universities/{batch_file}") as f:
        data = json.load(f)

    for school in data["universities"]:
        pairs = generate_pairs(school, "university")
        # Append to training file...
```

### Step 3: Validate and Deduplicate

```python
# validate_training_data.py
import json

def validate_pair(pair):
    messages = pair.get("messages", [])
    if len(messages) != 3:  # system + user + assistant
        return False
    if not messages[0]["content"].startswith("You are Wayfinder"):
        return False
    if len(messages[2]["content"]) < 100:  # Too short
        return False
    if ";" in messages[2]["content"]:  # Semicolon check
        return False
    return True

# Load, validate, deduplicate
with open("wayfinder-training-raw.jsonl") as f:
    pairs = [json.loads(line) for line in f]

valid = [p for p in pairs if validate_pair(p)]
# Deduplicate by user query similarity...

print(f"Valid: {len(valid)} / {len(pairs)} ({len(valid)/len(pairs)*100:.1f}%)")
```

### Step 4: Split Train/Eval

```python
import random
random.shuffle(valid)
split = int(len(valid) * 0.9)
train = valid[:split]
eval_set = valid[split:]

with open("wayfinder-train.jsonl", "w") as f:
    for p in train:
        f.write(json.dumps(p) + "\n")

with open("wayfinder-eval.jsonl", "w") as f:
    for p in eval_set:
        f.write(json.dumps(p) + "\n")
```

---

## 5. Post-Training

### Evaluation

Run the eval set through the fine-tuned model and compare against Opus:

```python
# evaluate.py
import together

# Generate responses from fine-tuned model
for eval_pair in eval_set:
    user_query = eval_pair["messages"][1]["content"]
    expected = eval_pair["messages"][2]["content"]

    response = together.Complete.create(
        model="your-finetuned-model-id",
        prompt=f"<|system|>{system_prompt}<|user|>{user_query}<|assistant|>",
        max_tokens=1024
    )

    generated = response.output.choices[0].text
    # Score: factual accuracy, tone, source citation, helpfulness
```

### Key metrics to track:
- **Factual accuracy**: Does the model cite correct numbers?
- **Source citation rate**: % of responses that cite data sources
- **Hallucination rate**: % of responses with fabricated data
- **Tone consistency**: Measured, professional, no semicolons
- **Query coverage**: Can it handle all category types?

### Inference Deployment

Together AI provides an inference endpoint immediately after training:

```python
import together

response = together.Complete.create(
    model="your-org/wayfinder-v1",  # Your fine-tuned model
    prompt=user_message,
    max_tokens=1024,
    temperature=0.7
)
```

**Estimated inference costs:**
- SLM (Together AI): ~$0.20 per 1M tokens → ~$0.0002 per query
- Claude Opus: ~$15 per 1M input tokens → ~$0.03 per query
- **Cost reduction: ~150x per query for SLM-routable questions**

### Integration with Wayfinder Backend

The hybrid model cascade in `backend/services/engine.js`:

```javascript
async function routeQuery(query, context) {
  // Classify query complexity
  const complexity = classifyComplexity(query);

  if (complexity === 'routine') {
    // Route to SLM — fast and cheap
    return await callSLM(query, context);
  } else {
    // Route to Opus — complex reasoning
    return await callOpus(query, context);
  }
}

function classifyComplexity(query) {
  // Simple heuristic for v1:
  // - School lookups, data queries, comparisons → routine
  // - Multi-step strategy, essay review, novel scenarios → complex
  const routinePatterns = [
    /acceptance rate/i, /salary for/i, /tell me about/i,
    /compare.*vs/i, /demographics/i, /deadline/i
  ];
  return routinePatterns.some(p => p.test(query)) ? 'routine' : 'complex';
}
```

---

## 6. The Flywheel Plan

### Quarterly Retraining Cadence

| Quarter | Focus | Data Added |
|---------|-------|-----------|
| Q1 2026 | **v1 Launch** | Current dataset (~50K pairs) |
| Q2 2026 | **v1.1** | + User interaction logs, + expanded school coverage |
| Q3 2026 | **v2** | + Full IPEDS bulk data, + high school profiles nationwide |
| Q4 2026 | **v3** | + Graduate programs, + international universities |

### Using Interaction Logs

```python
# Every Engine query is logged (anonymized)
# After 3 months, extract high-quality interactions:
# 1. Filter for queries where user gave positive feedback
# 2. Filter for multi-turn conversations (user engaged)
# 3. Use Opus to validate and improve the responses
# 4. Add to training dataset for next cycle
```

### A/B Testing SLM vs Opus

```javascript
// In production, randomly route 10% of "routine" queries to Opus
// Compare response quality scores
// If SLM quality drops below threshold, escalate to Opus
async function routeWithABTest(query, context) {
  const complexity = classifyComplexity(query);

  if (complexity === 'routine') {
    if (Math.random() < 0.1) {
      // A/B test: send to both, log comparison
      const [slmResponse, opusResponse] = await Promise.all([
        callSLM(query, context),
        callOpus(query, context)
      ]);
      logComparison(query, slmResponse, opusResponse);
      return slmResponse; // Still serve SLM to user
    }
    return await callSLM(query, context);
  }
  return await callOpus(query, context);
}
```

### Quality Monitoring

Track these metrics weekly:
- **SLM hallucination rate** (target: < 2%)
- **Source citation rate** (target: > 80%)
- **User engagement** (avg conversation length)
- **Escalation rate** (% of queries routed to Opus)
- **Cost per query** (should decrease as SLM handles more)

---

## Quick Start Checklist

- [ ] Create Together AI account (together.ai)
- [ ] Run training pair generation script (uses Opus API)
- [ ] Validate and format JSONL dataset
- [ ] Upload to Together AI
- [ ] Start fine-tuning (~2-4 hours)
- [ ] Evaluate against held-out eval set
- [ ] Deploy inference endpoint
- [ ] Integrate into Wayfinder backend with routing logic
- [ ] Monitor quality metrics for 2 weeks
- [ ] Plan v1.1 with expanded data + interaction logs
