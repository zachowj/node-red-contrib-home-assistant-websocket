#!/bin/bash

# -------------------------------
# Script to link local library into Node-RED
# Automatically detects environment: WSL vs Docker
# Usage:
#   ./link.sh [node_red_dir]
# If node_red_dir is provided, it overrides auto-detection
# -------------------------------

# Resolve absolute path of the current directory (library project)
LIB_DIR=$(pwd)

# Check that the library has a package.json
if [ ! -f "$LIB_DIR/package.json" ]; then
    echo "Error: No package.json found in $LIB_DIR. Run this script from your library project."
    exit 1
fi

# Auto-detect environment if no argument is provided
if [ -z "$1" ]; then
    if grep -qi microsoft /proc/version 2>/dev/null; then
        # WSL environment
        NR_DIR="$HOME/.node-red"
        echo "Detected WSL environment. Using Node-RED directory: $NR_DIR"
    else
        # Assume Docker or other Linux environment
        NR_DIR=".node-red"
        echo "Assuming Docker/other environment. Using Node-RED directory: $NR_DIR"
    fi
else
    NR_DIR="$1"
    echo "Using Node-RED directory from argument: $NR_DIR"
fi

# Check that Node-RED directory exists
if [ ! -d "$NR_DIR" ]; then
    echo "Error: Node-RED directory '$NR_DIR' does not exist."
    exit 1
fi

# Link the library into Node-RED directory
echo "Linking library '$LIB_DIR' into Node-RED at '$NR_DIR'..."
pnpm --dir "$NR_DIR" link 

echo "Done! The library is now symlinked into Node-RED."
