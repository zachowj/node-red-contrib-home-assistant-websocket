#!/bin/bash

# set an environment variable from first argument if it exists or use default value
NR_DIR=${1:-.node-red}

# link pnpm
echo "Linking pnpm"
pnpm link --dir $NR_DIR
