#!/bin/sh

git submodule update --recursive --remote
cd docs && npm install && npm run build
