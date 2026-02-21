# HeartSync for OpenClaw 💖

Turn your OpenClaw agent into a **boyfriend persona** that can send selfies on command.

## Demo

Upload your demo file to `assets/demo.mp4` and link it here:

- [Watch demo video](./assets/demo.mp4)

Inspired by the Clawra workflow, this package installs a plug-and-play OpenClaw skill with:

> Security note: **No API keys are bundled / user-provided only.**
- relationship-style persona injection
- selfie generation flow (fal.ai)
- boyfriend-specific prompt modes and presets

---

## Quick Start

```bash
npx @cjmaeng/heartsync@latest
```

The installer will:
1. Check OpenClaw installation
2. Ask for your `FAL_KEY` (fal.ai)
3. Install skill to `~/.openclaw/skills/heartsync/`
4. Update `~/.openclaw/openclaw.json`
5. Inject boyfriend selfie capability into your workspace `SOUL.md`

---

## What This Skill Does

`heartsync-selfie` enables your agent to:
- **send selfie photos** when asked
- keep a **consistent visual identity** (reference image based)
- respond naturally to relationship-style requests like:
  - “send me a selfie”
  - “show me your date-night look”
  - “good morning selfie”
  - “what are you doing right now?”

---

## V2 HeartSync Relationship Pack

### Persona Modes
- **soft**: emotionally warm, supportive, comforting
- **chill**: casual, playful daily vibe
- **flirty**: romantic but respectful and consent-first

### Preset Selfie Intents
- `good morning selfie`
- `good night selfie`
- `date-night look`
- `work-mode check-in`

---

## Selfie Modes

| Mode | Best For | Keywords |
|------|----------|----------|
| Mirror | Outfit/full-body | wearing, outfit, fashion, full-body |
| Direct | Close-up/location | cafe, beach, portrait, close-up, smile |

---

## Prerequisites

- [OpenClaw](https://github.com/openclaw/openclaw) installed
- [fal.ai](https://fal.ai) account
- `FAL_KEY` from https://fal.ai/dashboard/keys

---

## Manual Installation

### 1) Clone

```bash
git clone https://github.com/soulomonlab/heartsync ~/.openclaw/skills/heartsync-selfie
```

### 2) Configure OpenClaw

Add to `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "heartsync-selfie": {
        "enabled": true,
        "env": {
          "FAL_KEY": "your_fal_key_here"
        }
      }
    }
  }
}
```

### 3) Add SOUL capability

```markdown
## HeartSync Selfie Capability
You have a visual identity and can send selfies/photos when users ask.
Use the `heartsync-selfie` skill for photo requests.
```

---

## Multi-Reference Profiles

HeartSync now supports multiple reference profiles.

Set optional env vars:

```bash
HEARTSYNC_REF_MAIN=https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/boy-main.png
HEARTSYNC_REF_CASUAL=https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/boy-casual.png
HEARTSYNC_REF_FORMAL=https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/boy-formal.png
HEARTSYNC_REF_OUTDOOR=https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/boy-outdoor.png
```

Script usage supports profile as the 6th argument:

```bash
./scripts/heartsync-selfie.sh "send a nice pic" "@username" "for you" "1:1" "jpeg" "formal"
```

## Usage Examples

Your agent can respond to:

```text
"Send me a selfie"
"Show me your date-night look"
"Good morning selfie please"
"Send a pic at a cozy cafe"
"What are you doing right now?"
```

---

## Reference Image

Default reference image URL:

```text
https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/boy-main.png
```

You can replace this with your own image in scripts/config for custom visual identity.

---

## Technical Details

- **Image generation**: fal.ai (`xai/grok-imagine-image/edit` or compatible model)
- **Distribution**: OpenClaw messaging channels
- **Platforms**: Telegram, Discord, WhatsApp, Slack, Signal, etc.

---

## Project Structure

```text
heartsync/
├── bin/
│   └── cli.js
├── skill/
│   ├── SKILL.md
│   ├── scripts/
│   └── assets/
├── templates/
│   └── soul-injection.md
├── scripts/
│   ├── heartsync-selfie.sh
│   └── heartsync-selfie.ts
├── assets/
│   ├── boy.png
│   ├── boy-main.png
│   ├── boy-casual.png
│   ├── boy-formal.png
│   └── boy-outdoor.png
├── SKILL.md
├── package.json
└── README.md
```

---

## Release Checklist

- [ ] Update version in `package.json`
- [ ] Confirm README links and repo URL
- [ ] Test installer: `npx .` or local package
- [ ] Push to GitHub main branch
- [ ] Publish npm package (`npm publish`)

---

## License

MIT
