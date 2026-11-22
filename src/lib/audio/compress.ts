import { Mp3Encoder } from "@breezystack/lamejs";

export const BITRATE_OPTIONS = [
  { value: "48", label: "Smallest — 48 kbps" },
  { value: "64", label: "Small — 64 kbps" },
  { value: "96", label: "Balanced — 96 kbps" },
  { value: "128", label: "Good — 128 kbps" },
  { value: "192", label: "High — 192 kbps" },
];

export const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
export const MAX_AUDIO_FILES = 10;

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|ogg|oga|flac|opus|webm)$/i;

export function isSupportedAudioFile(file: { name: string; type: string }): boolean {
  return file.type.startsWith("audio/") || AUDIO_EXT.test(file.name);
}

/** Low bitrates use a lower sample rate (MPEG-2) for better quality per bit. */
export function targetSampleRate(kbps: number): number {
  return kbps <= 64 ? 22050 : 44100;
}

export interface CompressOptions {
  kbps: number;
  mono: boolean;
  onProgress?: (fraction: number) => void;
}

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function toInt16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** Decodes an audio file in the browser and re-encodes it as an MP3 Blob. */
export async function compressAudio(file: File, { kbps, mono, onProgress }: CompressOptions): Promise<Blob> {
  if (file.size > MAX_AUDIO_BYTES) throw new Error("This file is larger than the 100 MB limit.");

  const rate = targetSampleRate(kbps);
  const AudioCtx: typeof AudioContext =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error("This audio format couldn't be read by your browser.");
  } finally {
    void ctx.close();
  }

  const channels = mono ? 1 : Math.min(2, decoded.numberOfChannels);
  const offline = new OfflineAudioContext(channels, Math.max(1, Math.ceil(decoded.duration * rate)), rate);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();

  const left = toInt16(rendered.getChannelData(0));
  const right = channels === 2 ? toInt16(rendered.getChannelData(1)) : null;

  const encoder = new Mp3Encoder(channels, rate, kbps);
  const block = 1152 * 20;
  const parts: Uint8Array[] = [];
  for (let i = 0, n = 0; i < left.length; i += block, n++) {
    const l = left.subarray(i, i + block);
    const chunk = right ? encoder.encodeBuffer(l, right.subarray(i, i + block)) : encoder.encodeBuffer(l);
    if (chunk.length) parts.push(new Uint8Array(chunk));
    if (n % 20 === 0) {
      onProgress?.(i / left.length);
      await tick();
    }
  }
  const tail = encoder.flush();
  if (tail.length) parts.push(new Uint8Array(tail));
  onProgress?.(1);

  return new Blob(parts as BlobPart[], { type: "audio/mpeg" });
}
