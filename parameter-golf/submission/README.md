# 11L LeakyReLU(0.75)² + XSA-8 + BigramHash3072 + Legal TTT + Parallel Muon

## Architecture

| Component | Setting | Delta vs SOTA |
|---|---|---|
| Layers | 11, 512d, 8H, 4KV (GQA) | Same |
| Activation | **LeakyReLU(0.75)²** in 3x MLP | Slope 0.5 → 0.75 |
| Attention | **XSA on last 8 layers** | 4 → 8 layers |
| Position | Partial RoPE (16/64 dims) | Same |
| Norm | LN scale 1/sqrt(layer+1) | Same |
| Vocabulary | **BigramHash 3072** | 2048 → 3072 |
| Weight avg | EMA(0.997) + SWA(50 steps) | Same |
| Quantization | GPTQ-lite int6 + **LZMA preset 9** | preset 6 → 9 |

## Key Changes from PR #549 (Current SOTA, 1.1194 BPB)

### 1. LeakyReLU(0.75)² Activation
Increased negative slope from 0.5 to 0.75. Higher slope preserves more gradient flow through negative pre-activations while still maintaining the non-negative output guarantee via squaring. Based on ablation direction from PR #1092 (XSA-All testing with slope 0.75).

### 2. XSA on 8 Layers (vs 4)
Extended cross-layer self-attention from the last 4 layers to the last 8. XSA subtracts the self-value projection from attention output, encouraging heads to learn complementary information across layers. More layers with XSA increases the diversity of learned representations.

### 3. BigramHash 3072 (vs 2048)
Increased bigram hash vocabulary from 2048 to 3072. The bigram hash embedding captures character-pair statistics that help the model with subword boundaries. Larger vocabulary reduces hash collisions, providing more distinct bigram representations.

### 4. TTT: All Blocks Unfrozen + 4 Epochs
- Changed `TTT_FREEZE_BLOCKS` from 2 → 0 (all blocks adapt during TTT)
- Increased TTT epochs from 3 → 4 for deeper adaptation per chunk
- SOTA ablation showed -0.0004 BPB from unfreezing all blocks

### 5. LZMA Preset 9 (vs 6)
Better compression ratio for the artifact, potentially freeing space for the larger BigramHash table.

## Training Configuration

- **Optimizer**: Parallel Muon (4 parameter banks, batched Newton-Schulz)
- **LR**: matrix/scalar 0.025, tied embed 0.035
- **Momentum**: 0.99 (warmup 0.92 → 0.99 over 1500 steps)
- **Weight decay**: 0.04
- **Warmdown**: 3500 iterations
- **Batch**: 786,432 tokens/step, seq_len 2048
- **EMA**: decay 0.997
- **SWA**: every 50 steps during warmdown

## TTT Configuration

- Legal score-first backward-looking protocol
- SGD (lr=0.002, momentum=0.9), cosine decay
- 4 epochs per chunk, 32K-token chunks
- All blocks unfrozen, gradient clip 1.0

## Expected Improvements

| Change | Expected BPB Delta |
|---|---|
| LeakyReLU(0.75)² | -0.001 to -0.002 |
| XSA-8 | -0.001 to -0.002 |
| BigramHash 3072 | -0.0005 to -0.001 |
| TTT 4 epochs + unfreeze all | -0.001 to -0.002 |
| **Total expected** | **-0.004 to -0.007** |

## Attribution

Based on:
- PR #549 / abaybektursun: LeakyReLU² + Legal TTT + Parallel Muon (1.1194 BPB)
- PR #414 / signalrush: 11L EMA + GPTQ-lite base
- PR #493, #518: Activation function innovations
- PR #461: Legal TTT recipe
- PR #399: Parallel Muon optimizer
- PR #1092: XSA-All + LeakyReLU(0.75)² exploration

## How to Run

```bash
# Training (8xH100)
TTT_ENABLED=1 torchrun --nproc_per_node=8 train_gpt.py

# With custom seed
SEED=42 TTT_ENABLED=1 torchrun --nproc_per_node=8 train_gpt.py
```
