import { SimpleFormatConverterTool } from "./SimpleFormatConverterTool";

export function PngToJpgTool() {
  return <SimpleFormatConverterTool toolSlug="png-to-jpg" targetFormat="jpeg" toolTitle="Convert to JPG" fromHint="Upload a PNG (or any supported image), up to 15MB." />;
}

export default PngToJpgTool;
