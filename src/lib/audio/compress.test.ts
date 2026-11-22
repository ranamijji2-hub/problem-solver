import { describe, expect, it } from "vitest";
import { isSupportedAudioFile, targetSampleRate } from "./compress";

describe("isSupportedAudioFile", () => {
  it("accepts audio mime types and known extensions", () => {
    expect(isSupportedAudioFile({ name: "a.bin", type: "audio/mpeg" })).toBe(true);
    expect(isSupportedAudioFile({ name: "voice.M4A", type: "" })).toBe(true);
  });
  it("rejects non-audio files", () => {
    expect(isSupportedAudioFile({ name: "photo.jpg", type: "image/jpeg" })).toBe(false);
  });
});

describe("targetSampleRate", () => {
  it("uses 22.05 kHz for low bitrates and 44.1 kHz otherwise", () => {
    expect(targetSampleRate(48)).toBe(22050);
    expect(targetSampleRate(64)).toBe(22050);
    expect(targetSampleRate(128)).toBe(44100);
  });
});
