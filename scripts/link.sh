#!/bin/bash
set -e

# -------------------------------
# Script to link local library into Node-RED 
# Automatically detects environment: WSL vs Docker
# Usage:
#   ./link.sh [node_red_dir]
# -------------------------------

LIB_DIR=$(pwd)

# Ensure package.json exists
if [ ! -f "$LIB_DIR/package.json" ]; then
    echo "Error: No package.json found in $LIB_DIR"
    exit 1
fi

# Extract library name from package.json using grep/sed
LIB_NAME=$(grep -m1 '"name"' "$LIB_DIR/package.json" | sed -E 's/.*"name" *: *"([^"]+)".*/\1/')
if [ -z "$LIB_NAME" ]; then
    echo "Error: Could not read library name from package.json"
    exit 1
fi

# Auto-detect Node-RED directory
if [ -z "$1" ]; then
    if grep -qi microsoft /proc/version 2>/dev/null; then
        NR_DIR="$HOME/.node-red"
        echo "Detected WSL environment. Using Node-RED directory: $NR_DIR"
    else
        NR_DIR=".node-red"
        echo "Assuming Docker/other environment. Using Node-RED directory: $NR_DIR"
    fi
else
    NR_DIR="$1"
    echo "Using Node-RED directory from argument: $NR_DIR"
fi

if [ ! -d "$NR_DIR" ]; then
    echo "Error: Node-RED directory '$NR_DIR' does not exist."
    exit 1
fi

echo "Linking library '$LIB_NAME' from '$LIB_DIR' into Node-RED at '$NR_DIR'..."

# Step 1: Ensure library is ready to be linked (optional)
pnpm --dir "$LIB_DIR" install

# Step 2: Perform local link into Node-RED (no global)
pnpm --dir "$NR_DIR" link "$LIB_DIR"

echo "✅ Done! '$LIB_NAME' is now locally symlinked into Node-RED."
