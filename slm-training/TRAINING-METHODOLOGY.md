# Wayfinder SLM Training Methodology — Advanced Techniques

## 5-Layer Training Data Architecture

### Layer 1: Chain of Thought (CoT) Reasoning
All Test Prep pairs must show step-by-step logical progression. The SLM should mimic a human tutor's reasoning process, not jump to answers.

**Format:** Each assistant response shows the thinking steps explicitly:
- "Let's break this down step by step..."
- "First, identify what we know... Second, what we need to find..."
- "The common mistake here is... Here's why that logic fails..."

### Layer 2: DPO (Direct Preference Optimization) Pairs
For every "Gold Standard" response, include a "Rejected" response that is technically correct but strategically poor.

**Format:**
```json
{
  "prompt": "user question",
  "chosen": "Wayfinder Gold response (warm, strategic, insightful, personalized)",
  "rejected": "Generic response (technically correct but too wordy, lacks empathy, or gives cookie-cutter advice)"
}
```

**What makes a response "rejected":**
- Too generic (could come from any chatbot)
- Lacks empathy or emotional intelligence
- Dumps information without strategic framing
- Misses the subtext of what the user is really asking
- Too wordy without proportional insight
- No actionable next steps
- Doesn't adapt to the specific user's context

### Layer 3: Dynamic Persona Injection
The same question should get different answers based on WHO is asking. Training data must vary the user across:
- Academic background (4.0 GPA vs 3.0 GPA)
- Grade level (freshman vs senior)
- Socioeconomic context (affluent vs low-income vs middle)
- First-gen vs legacy vs international
- Emotional state (confident vs anxious vs apathetic)
- Parent vs student
- Geographic context (urban vs rural, different states)

### Layer 4: Self-Correction Loops
Train the model to catch and correct common misconceptions WITHOUT being dismissive.

**Pattern:**
1. User states a misconception ("I should take the SAT without studying to see where I am")
2. Model validates the INTENT ("I understand wanting a baseline — that instinct is right")
3. Model explains the strategic downside ("But here's what most people don't realize about score history...")
4. Model pivots to a better plan ("Instead, here's what I'd recommend...")

### Layer 5: Tool-Use Readiness
When the model hits a knowledge limit or needs real-time data, it should generate a structured request rather than hallucinate.

**Format:**
```json
{
  "tool_call": {
    "type": "database_lookup",
    "resource": "scholarship_database",
    "query": "CyberCorps Scholarship for Service participating institutions 2026",
    "reason": "I need to verify the current list of participating schools before advising"
  }
}
```

**Trigger phrases the model should learn:**
- "Let me check our database for the most current information on..."
- "I want to make sure I'm giving you the latest data. Let me look up..."
- "This is something that changes year to year, so let me verify..."

---

## The Golden Set: 7 Benchmark Prompts

For each, generate THREE response versions:
1. **Good**: Accurate, direct, helpful
2. **Wayfinder Gold**: CoT reasoning, validates emotion, multi-step strategic framework, "next level" action
3. **CoT Reasoning (Hidden)**: Explains the pedagogical logic behind the Gold response structure

### Prompt 1: The Unconventional Pivot (Career)
Junior, 3.8 GPA, orchestra/debate, wants cybersecurity, zero coding experience.

### Prompt 2: The Networking Architect (Career)
Cold outreach to FinTech startup Head of Engineering, no internship program listed.

### Prompt 3: The Narrative Flip (Admissions)
Grocery store summer job essay that feels boring and cliché.

### Prompt 4: The Gap Analysis (Admissions)
1550 SAT, 4.0, robotics captain, tutor. What's missing for T20 ME?

### Prompt 5: The Math Trap (Test Prep)
Rectangle 20% length increase + 20% width decrease. "Changes cancel out." Why wrong?

### Prompt 6: Evidence-Based Reading Strategy (Test Prep)
Stuck between two "Command of Evidence" quotes on SAT Reading.

### Prompt 7: Resource Integration (Integration/Tool-Use)
CyberCorps Scholarship for Service — explain + identify knowledge limits.

---

## JSONL Format for Advanced Training

### Standard CoT Pair:
```json
{"conversations": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "Let me think through this step by step..."}], "metadata": {"category": "...", "reasoning_type": "chain_of_thought"}}
```

### DPO Pair:
```json
{"prompt": "system prompt + user question", "chosen": "Wayfinder Gold response", "rejected": "Generic/poor response", "metadata": {"category": "...", "reasoning_type": "dpo"}}
```

### Self-Correction Pair:
```json
{"conversations": [{"role": "system", "content": "..."}, {"role": "user", "content": "[misconception]"}, {"role": "assistant", "content": "[validate intent] [explain downside] [better plan]"}], "metadata": {"category": "...", "reasoning_type": "self_correction"}}
```

### Tool-Use Pair:
```json
{"conversations": [{"role": "system", "content": "..."}, {"role": "user", "content": "[question requiring external data]"}, {"role": "assistant", "content": "[partial answer] [tool_call: {type, resource, query}] [explanation of what I'll verify]"}], "metadata": {"category": "...", "reasoning_type": "tool_use"}}
```
