#!/bin/bash

# setup pnpm 
echo "Setting up pnpm"
corepack enable && corepack enable npm

# set an environment variable from first argument if it exists or use default value
NR_DIR=${1:-.node-red}

# create directory if it doesn't exist
if [ ! -d "$NR_DIR" ]; then
  echo "Creating directory $NR_DIR"
  mkdir -p $NR_DIR
fi

# copy files from .devcontainer/nodered to the directory
echo "Copying files from .devcontainer/nodered to $NR_DIR"
cp -r .devcontainer/nodered/* $NR_DIR

# link pnpm
echo "Linking pnpm"
pnpm link --dir $NR_DIR
