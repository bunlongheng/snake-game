#!/bin/bash

# Dynamically get the project name from the current directory
project_name=${PWD##*/}

# Ensure Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (Only needed once)
if ! vercel whoami &> /dev/null
then
    echo "Logging into Vercel..."
    vercel login
    
fi

# Link to Vercel project (if not already linked)
if [ ! -f .vercel/project.json ]; then
    echo "Linking project '$project_name' to Vercel..."
    vercel link --project "$project_name" --yes
fi

# Deploy to production without prompts
echo "Deploying '$project_name' to Vercel..."
vercel --prod --yes