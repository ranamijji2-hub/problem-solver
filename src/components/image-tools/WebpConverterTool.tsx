import { SimpleFormatConverterTool } from "./SimpleFormatConverterTool";

export function WebpConverterTool() {
  return <SimpleFormatConverterTool toolSlug="webp-converter" targetFormat="webp" toolTitle="Convert to WebP" fromHint="Upload a JPG or PNG, up to 15MB." />;
}

export default WebpConverterTool;
