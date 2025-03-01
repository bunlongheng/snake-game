#!/bin/bash
project_name=${PWD##*/}
git init
git add .
git commit -m "Initial commit: Setup Next.js $project_name project"
gh repo create $project_name --public --source=. --remote=origin
git branch -M main
git push -u origin main
gh repo view --web
