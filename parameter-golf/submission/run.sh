#!/bin/bash
set -euo pipefail

SEED=${SEED:-1337}
echo "Running with SEED=$SEED"

export TTT_ENABLED=1
export SEED=$SEED

torchrun --nproc_per_node=8 train_gpt.py 2>&1 | tee "train_seed${SEED}.log"
