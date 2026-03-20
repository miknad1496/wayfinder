"""
Wayfinder SLM Local Training Script — RTX 5060 Ti (8GB VRAM)

This trains a LLaMA 3.1 8B model using QLoRA 4-bit quantization
on your local GPU. Designed for the RTX 5060 Ti with 8GB VRAM.

Hardware requirements:
  - GPU: RTX 5060 Ti (8GB VRAM) — or any GPU with 8GB+ VRAM
  - RAM: 32GB system RAM
  - Storage: ~30GB free (model weights + training data)
  - Time: ~8-14 hours for 3-5K training pairs

Setup:
  1. Install Miniconda: https://docs.conda.io/en/latest/miniconda.html
  2. conda create -n wayfinder python=3.11
  3. conda activate wayfinder
  4. pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
  5. pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
  6. pip install datasets transformers trl peft bitsandbytes accelerate

Usage:
  python slm-training/train-local-5060ti.py --model admissions
  python slm-training/train-local-5060ti.py --model career

Output:
  slm-training/output/wayfinder-admissions-lora/
  slm-training/output/wayfinder-career-lora/
"""

import argparse
import json
import os
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Train Wayfinder SLM locally')
    parser.add_argument('--model', choices=['admissions', 'career'], required=True,
                       help='Which SLM to train')
    parser.add_argument('--epochs', type=int, default=3,
                       help='Number of training epochs (default: 3)')
    parser.add_argument('--batch-size', type=int, default=1,
                       help='Batch size (keep at 1 for 8GB VRAM)')
    parser.add_argument('--grad-accum', type=int, default=8,
                       help='Gradient accumulation steps (effective batch = batch_size * grad_accum)')
    parser.add_argument('--lr', type=float, default=2e-4,
                       help='Learning rate (default: 2e-4)')
    parser.add_argument('--max-seq-len', type=int, default=2048,
                       help='Max sequence length (default: 2048)')
    parser.add_argument('--lora-rank', type=int, default=16,
                       help='LoRA rank (default: 16, higher = more capacity but more VRAM)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Just load data and show stats, don\'t train')
    args = parser.parse_args()

    print("=" * 60)
    print(f"  Wayfinder SLM Training — {args.model.upper()}")
    print(f"  GPU: RTX 5060 Ti (8GB VRAM) — QLoRA 4-bit")
    print("=" * 60)

    # ==========================================
    # STEP 1: Load and prepare training data
    # ==========================================
    print("\n[1/5] Loading training data...")

    script_dir = Path(__file__).parent
    data_file = script_dir / f"{args.model}-unified.jsonl"

    if not data_file.exists():
        print(f"  ERROR: {data_file} not found!")
        print(f"  Run: node slm-training/merge-training-data.js first")
        print(f"  Or specify the correct data file path")

        # Try to find individual files
        pattern = f"{args.model}-*.jsonl"
        files = list(script_dir.glob(pattern))
        if files:
            print(f"\n  Found {len(files)} individual files. Merging...")
            all_pairs = []
            for f in files:
                if 'unified' in f.name or 'validate' in f.name:
                    continue
                with open(f) as fh:
                    for line in fh:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            obj = json.loads(line)
                            if 'conversations' in obj:
                                all_pairs.append(obj)
                        except:
                            pass
            print(f"  Merged {len(all_pairs)} pairs from {len(files)} files")

            # Also try to load v1 pairs
            v1_file = script_dir / "training-pairs" / "wayfinder-pairs-v1.jsonl"
            if v1_file.exists():
                v1_count = 0
                with open(v1_file) as fh:
                    for line in fh:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            obj = json.loads(line)
                            if 'conversations' in obj:
                                all_pairs.append(obj)
                                v1_count += 1
                        except:
                            pass
                print(f"  Added {v1_count} v1 pairs")

            # Save merged file
            with open(data_file, 'w') as fh:
                for pair in all_pairs:
                    fh.write(json.dumps(pair) + '\n')
            print(f"  Saved to {data_file}")
        else:
            return

    # Count pairs
    pairs = []
    with open(data_file) as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    pairs.append(json.loads(line))
                except:
                    pass

    print(f"  Total training pairs: {len(pairs)}")
    if len(pairs) == 0:
        print("  ERROR: No valid training pairs found!")
        return

    # Show sample
    sample = pairs[0]
    turns = len(sample.get('conversations', []))
    print(f"  Sample pair has {turns} turns")
    print(f"  System prompt: {sample['conversations'][0]['content'][:80]}...")

    if args.dry_run:
        print(f"\n  [DRY RUN] Would train on {len(pairs)} pairs")
        print(f"  Estimated time: {len(pairs) * 0.003 * args.epochs:.0f} minutes")
        print(f"  (~{len(pairs) * 0.003 * args.epochs / 60:.1f} hours)")
        return

    # ==========================================
    # STEP 2: Load model with 4-bit quantization
    # ==========================================
    print("\n[2/5] Loading LLaMA 3.1 8B with 4-bit quantization...")

    from unsloth import FastLanguageModel
    import torch

    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name="unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
        max_seq_length=args.max_seq_len,
        dtype=None,  # Auto-detect
        load_in_4bit=True,
    )

    print(f"  Model loaded successfully")
    print(f"  GPU Memory: {torch.cuda.memory_allocated() / 1e9:.2f} GB")

    # ==========================================
    # STEP 3: Configure LoRA adapters
    # ==========================================
    print("\n[3/5] Configuring LoRA adapters...")

    model = FastLanguageModel.get_peft_model(
        model,
        r=args.lora_rank,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
        ],
        lora_alpha=args.lora_rank,  # alpha = rank is standard
        lora_dropout=0,
        bias="none",
        use_gradient_checkpointing="unsloth",  # Critical for 8GB VRAM
        random_state=42,
    )

    print(f"  LoRA rank: {args.lora_rank}")
    print(f"  Trainable parameters: {model.print_trainable_parameters()}")

    # ==========================================
    # STEP 4: Prepare dataset
    # ==========================================
    print("\n[4/5] Preparing dataset...")

    from datasets import Dataset

    # Convert conversations to training format
    def format_conversations(example):
        """Convert Wayfinder conversation format to training text"""
        conversations = example['conversations']
        text = ""
        for msg in conversations:
            role = msg['role']
            content = msg['content']
            if role == 'system':
                text += f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{content}<|eot_id|>"
            elif role == 'user':
                text += f"<|start_header_id|>user<|end_header_id|>\n\n{content}<|eot_id|>"
            elif role == 'assistant':
                text += f"<|start_header_id|>assistant<|end_header_id|>\n\n{content}<|eot_id|>"
        return {"text": text}

    dataset = Dataset.from_list(pairs)
    dataset = dataset.map(format_conversations, remove_columns=dataset.column_names)

    print(f"  Dataset size: {len(dataset)}")
    print(f"  Sample text length: {len(dataset[0]['text'])} chars")

    # ==========================================
    # STEP 5: Train!
    # ==========================================
    print("\n[5/5] Starting training...")
    print(f"  Epochs: {args.epochs}")
    print(f"  Batch size: {args.batch_size}")
    print(f"  Gradient accumulation: {args.grad_accum}")
    print(f"  Effective batch size: {args.batch_size * args.grad_accum}")
    print(f"  Learning rate: {args.lr}")
    print(f"  Estimated time: {len(dataset) * 0.003 * args.epochs / 60:.1f} hours")
    print("")

    from trl import SFTTrainer
    from transformers import TrainingArguments

    output_dir = script_dir / "output" / f"wayfinder-{args.model}-lora"

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=dataset,
        dataset_text_field="text",
        max_seq_length=args.max_seq_len,
        dataset_num_proc=2,
        packing=True,  # Efficient packing of short sequences
        args=TrainingArguments(
            output_dir=str(output_dir),
            per_device_train_batch_size=args.batch_size,
            gradient_accumulation_steps=args.grad_accum,
            warmup_steps=10,
            num_train_epochs=args.epochs,
            learning_rate=args.lr,
            fp16=not torch.cuda.is_bf16_supported(),
            bf16=torch.cuda.is_bf16_supported(),
            logging_steps=10,
            save_steps=100,
            save_total_limit=3,
            optim="adamw_8bit",
            weight_decay=0.01,
            lr_scheduler_type="cosine",
            seed=42,
            report_to="none",  # No wandb needed
        ),
    )

    # Show GPU memory before training
    print(f"  GPU Memory before training: {torch.cuda.memory_allocated() / 1e9:.2f} GB")

    # Train
    stats = trainer.train()
    print(f"\n  Training complete!")
    print(f"  Training loss: {stats.training_loss:.4f}")
    print(f"  Runtime: {stats.metrics['train_runtime'] / 3600:.1f} hours")

    # ==========================================
    # Save the model
    # ==========================================
    print(f"\n  Saving LoRA adapter to: {output_dir}")
    model.save_pretrained(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))

    # Also save merged model for easy deployment with Ollama
    merged_dir = script_dir / "output" / f"wayfinder-{args.model}-merged"
    print(f"  Saving merged model to: {merged_dir}")
    model.save_pretrained_merged(str(merged_dir), tokenizer, save_method="merged_16bit")

    # Create Ollama Modelfile for easy local deployment
    modelfile_path = script_dir / "output" / f"Modelfile-{args.model}"
    with open(modelfile_path, 'w') as f:
        system_prompt = (
            "You are Wayfinder, an elite AI college admissions consultant."
            if args.model == 'admissions' else
            "You are Wayfinder, an AI career strategist."
        )
        f.write(f"""FROM {merged_dir}
SYSTEM {system_prompt}
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER num_ctx 2048
""")
    print(f"  Ollama Modelfile saved: {modelfile_path}")
    print(f"\n  To deploy with Ollama:")
    print(f"    ollama create wayfinder-{args.model} -f {modelfile_path}")
    print(f"    ollama run wayfinder-{args.model}")

    print(f"\n{'=' * 60}")
    print(f"  TRAINING COMPLETE — wayfinder-{args.model}")
    print(f"  LoRA adapter: {output_dir}")
    print(f"  Merged model: {merged_dir}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
