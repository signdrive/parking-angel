#!/bin/sh

git checkout --orphan latest_branch
git add -A
git commit -am 'Fresh start without secrets'
git branch -D main
git branch -m main
git push -f origin main

