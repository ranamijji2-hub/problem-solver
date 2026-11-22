import type { ToolDefinition } from "./types";

// Audio tools run entirely client-side (Web Audio API + an in-browser MP3
// encoder, see src/lib/audio/compress.ts): no upload, no server cost.

export const audioTools: ToolDefinition[] = [
  {
    slug: "audio-compressor",
    category: "audio-tools",
    name: "Audio Compressor",
    shortDescription: "Shrink audio files to smaller MP3s with a quality level you choose.",
    longDescription:
      "Upload MP3, WAV, M4A, OGG or FLAC files, pick a quality from 48 to 192 kbps, optionally convert to mono, and download compressed MP3s — individually or all at once as a ZIP. Everything runs in your browser.",
    status: "live",
    keywords: ["audio compressor", "compress audio", "compress mp3", "reduce audio file size", "wav to mp3", "shrink mp3"],
    problemPhrases: [
      "my audio file is too big",
      "compress an mp3",
      "reduce the size of a voice recording",
      "make a wav file smaller",
    ],
    runsClientSide: true,
    faqs: [
      {
        question: "Are my audio files uploaded anywhere?",
        answer: "No. Compression happens entirely in your browser, so your audio never leaves your device.",
      },
      {
        question: "Which quality should I choose?",
        answer:
          "128 kbps is a good all-round default for music. For voice recordings, 64 kbps with mono is usually plenty and much smaller.",
      },
      {
        question: "Why is my compressed file not smaller?",
        answer:
          "If the original is already a low-bitrate MP3, re-encoding at a higher quality can't make it smaller. Choose a lower quality or convert to mono.",
      },
    ],
  },
];
