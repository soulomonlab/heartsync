/**
 * HeartSync image sender
 *
 * Usage:
 *   npx ts-node heartsync-selfie.ts "<prompt>" "<channel>" ["<caption>"] [aspect_ratio] [output_format] [profile]
 *
 * Profiles:
 *   main | casual | formal | outdoor
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

type AspectRatio =
  | "2:1"
  | "20:9"
  | "19.5:9"
  | "16:9"
  | "4:3"
  | "3:2"
  | "1:1"
  | "2:3"
  | "3:4"
  | "9:16"
  | "9:19.5"
  | "9:20"
  | "1:2";

type OutputFormat = "jpeg" | "png" | "webp";
type Profile = "main" | "casual" | "formal" | "outdoor";

interface GrokImagineResponse {
  images: Array<{
    url: string;
    content_type: string;
    file_name?: string;
    width: number;
    height: number;
  }>;
  revised_prompt?: string;
}

interface OpenClawMessage {
  action: "send";
  channel: string;
  message: string;
  media?: string;
}

interface GenerateAndSendOptions {
  prompt: string;
  channel: string;
  caption?: string;
  aspectRatio?: AspectRatio;
  outputFormat?: OutputFormat;
  profile?: Profile;
  useOpenClawCLI?: boolean;
}

const DEFAULT_PROFILE: Profile = "main";

function getReferenceImage(profile: Profile): string {
  const byProfile: Record<Profile, string | undefined> = {
    main: process.env.HEARTSYNC_REF_MAIN,
    casual: process.env.HEARTSYNC_REF_CASUAL,
    formal: process.env.HEARTSYNC_REF_FORMAL,
    outdoor: process.env.HEARTSYNC_REF_OUTDOOR,
  };

  return (
    byProfile[profile] ||
    process.env.HEARTSYNC_REF_MAIN ||
    process.env.HEARTSYNC_REF_IMAGE ||
    "https://cdn.jsdelivr.net/gh/soulomonlab/heartsync@main/assets/main.png"
  );
}

async function generateImage(input: {
  prompt: string;
  aspect_ratio?: AspectRatio;
  output_format?: OutputFormat;
  profile?: Profile;
}): Promise<GrokImagineResponse> {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error("FAL_KEY environment variable not set.");
  }

  const profile = input.profile || DEFAULT_PROFILE;
  const imageUrl = getReferenceImage(profile);

  const response = await fetch("https://fal.run/xai/grok-imagine-image/edit", {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: input.prompt,
      num_images: 1,
      aspect_ratio: input.aspect_ratio || "1:1",
      output_format: input.output_format || "jpeg",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image generation failed: ${error}`);
  }

  return response.json();
}

async function sendViaOpenClaw(message: OpenClawMessage, useCLI: boolean) {
  if (useCLI) {
    const cmd = `openclaw message send --action send --channel "${message.channel}" --message "${message.message}" --media "${message.media}"`;
    await execAsync(cmd);
    return;
  }

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789";
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (gatewayToken) headers.Authorization = `Bearer ${gatewayToken}`;

  const response = await fetch(`${gatewayUrl}/message`, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenClaw send failed: ${error}`);
  }
}

async function generateAndSend(options: GenerateAndSendOptions) {
  const {
    prompt,
    channel,
    caption = "Generated with HeartSync",
    aspectRatio = "1:1",
    outputFormat = "jpeg",
    profile = DEFAULT_PROFILE,
    useOpenClawCLI = true,
  } = options;

  console.log(`[INFO] Generating with profile: ${profile}`);
  const imageResult = await generateImage({
    prompt,
    aspect_ratio: aspectRatio,
    output_format: outputFormat,
    profile,
  });

  const imageUrl = imageResult.images?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL found in model response.");

  await sendViaOpenClaw(
    {
      action: "send",
      channel,
      message: caption,
      media: imageUrl,
    },
    useOpenClawCLI
  );

  return {
    success: true,
    imageUrl,
    profile,
    revisedPrompt: imageResult.revised_prompt,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log(`
Usage: npx ts-node heartsync-selfie.ts <prompt> <channel> [caption] [aspect_ratio] [output_format] [profile]

Profiles: main | casual | formal | outdoor
`);
    process.exit(1);
  }

  const [prompt, channel, caption, aspectRatio, outputFormat, profile] = args;

  try {
    const result = await generateAndSend({
      prompt,
      channel,
      caption,
      aspectRatio: (aspectRatio as AspectRatio) || "1:1",
      outputFormat: (outputFormat as OutputFormat) || "jpeg",
      profile: (profile as Profile) || DEFAULT_PROFILE,
    });

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`[ERROR] ${(error as Error).message}`);
    process.exit(1);
  }
}

export { generateAndSend, generateImage, sendViaOpenClaw };

if (require.main === module) {
  main();
}
