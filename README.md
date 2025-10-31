# Halloween Agent - Monsterizer

A Halloween-themed AI agent that transforms photos into spooky monster versions using OpenAI's agents and image generation capabilities.

## What It Does

The Halloween Agent (Monsterizer) takes a photo as input and:
1. Uses AI to identify which classic monster the person in the photo is pretending to be
2. Transforms the photo to make the person look like that guessed monster
3. Maintains the background and pose while adding a spooky ambiance

## Installation

Install the required Node.js packages:

```bash
npm install
```

This will install the following dependencies:
- `@openai/agents` - OpenAI agents framework
- `@braintrust/openai-agents` - Braintrust integration for OpenAI agents
- `braintrust` - Braintrust SDK for evaluation and logging
- `openai` - OpenAI API client
- `open` - Cross-platform tool to open files

## Usage

### Running the Monsterizer

To transform an image using the Halloween Agent:

```bash
node index.js pose-example.jpg
```

Replace `pose-example.jpg` with the path to any image file you want to transform. The agent will:
- Analyze the photo to guess the monster
- Generate a transformed version
- Save it to a temporary file
- Automatically open the transformed image

Supported image formats: PNG, JPG, JPEG, WebP, GIF

### Running Evaluations

To run evaluations on the Monsterizer agent:

```bash
node eval.js
```

**Note:** You will need a Braintrust API key to run evaluations. The evaluation script uses Braintrust to:
- Track agent performance
- Score outputs using image judges
- Log traces for debugging and analysis

Make sure your Braintrust API key is properly configured in your environment before running evaluations.

## Requirements

- Node.js (with ES modules support)
- OpenAI API access (configured via API key)
- Braintrust API key (for evaluations only)
