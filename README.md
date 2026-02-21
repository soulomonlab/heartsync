# Boyfriend Selfie (OpenClaw Skill)
<img width="300"  alt="image" src="https://github.com/user-attachments/assets/41512c51-e61d-4550-b461-eed06a1b0ec8" />


## Quick Start

```bash
npx boyfriend-selfie@latest
```

This will:
1. Check OpenClaw is installed
2. Guide you to get a fal.ai API key
3. Install the skill to `~/.openclaw/skills/boyfriend-selfie/`
4. Configure OpenClaw to use the skill
5. Add selfie capabilities to your agent's SOUL.md

## What It Does

Boyfriend Selfie enables your OpenClaw agent to:
- **Generate selfies** using a consistent reference image
- **Send photos** across all messaging platforms (Discord, Telegram, WhatsApp, etc.)
- **Respond visually** to "what are you doing?" and "send a pic" requests

### Selfie Modes

| Mode | Best For | Keywords |
|------|----------|----------|
| **Mirror** | Full-body shots, outfits | wearing, outfit, fashion |
| **Direct** | Close-ups, locations | cafe, beach, portrait, smile |

## Prerequisites

- [OpenClaw](https://github.com/openclaw/openclaw) installed and configured
- [fal.ai](https://fal.ai) account (free tier available)

## Manual Installation

If you prefer manual setup:

### 1. Get API Key

Visit [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) and create an API key.

### 2. Clone the Skill

```bash
git clone https://github.com/chaejeong/boyfriend-selfie ~/.openclaw/skills/boyfriend-selfie
```

### 3. Configure OpenClaw

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "boyfriend-selfie": {
        "enabled": true,
        "env": {
          "FAL_KEY": "your_fal_key_here"
        }
      }
    }
  }
}
```

### 4. Update SOUL.md

Add the selfie persona to `~/.openclaw/workspace/SOUL.md`:

```markdown
## Boyfriend Selfie Capability

You have a physical appearance and can take selfies!
When users ask for pictures, use the boyfriend-selfie skill.
```

## Usage Examples

Once installed, your agent responds to:

```
"Send me a selfie"
"Send a pic wearing a cowboy hat"
"What are you doing right now?"
"Show me you at a coffee shop"
```

## Reference Image

The skill uses a fixed reference image hosted on CDN:

```
https://cdn.jsdelivr.net/gh/chaejeong/boyfriend-selfie@main/assets/boyfriend.png
```

This ensures consistent appearance across all generated images.

## Technical Details

- **Image Generation**: xAI Grok Imagine via fal.ai
- **Messaging**: OpenClaw Gateway API
- **Supported Platforms**: Discord, Telegram, WhatsApp, Slack, Signal, MS Teams

## V2 Relationship Pack

This fork adds a boyfriend-focused relationship layer:

- **Persona modes**
  - `soft`: comforting and emotionally validating
  - `chill`: casual, low-pressure, playful daily vibe
  - `flirty`: light romantic energy (respectful, consent-first)
- **Preset selfie intents**
  - `good-morning selfie`
  - `good-night selfie`
  - `date-night look`
  - `work-mode check-in`

Use these as keywords in user prompts, e.g.:
- "send a good morning selfie"
- "show me your date-night look"
- "send a chill work-mode pic"

## Project Structure

```
boyfriend-selfie/
├── bin/
│   └── cli.js           # npx installer
├── skill/
│   ├── SKILL.md         # Skill definition
│   ├── scripts/         # Generation scripts
│   └── assets/          # Reference image
├── templates/
│   └── soul-injection.md # Persona template
└── package.json
```

## License

MIT
