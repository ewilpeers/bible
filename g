#!/bin/bash
git add bible/*/*.json
git add bible/index.html
if [ -z "$1" ]; then
    git commit -m "db update"
else
    git commit -m "$1"
fi