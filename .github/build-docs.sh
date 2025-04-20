#!/bin/sh

git submodule init && git submodule update
cd docs && npm install && npm run build
