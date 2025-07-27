#!/bin/bash
# Quick git status check

pwd
git status --porcelain
git log --oneline -3
git remote -v
