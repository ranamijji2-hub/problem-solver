import { SimpleFormatConverterTool } from "./SimpleFormatConverterTool";

export function JpgToPngTool() {
  return <SimpleFormatConverterTool toolSlug="jpg-to-png" targetFormat="png" toolTitle="Convert to PNG" fromHint="Upload a JPG (or any supported image), up to 15MB." />;
}

export default JpgToPngTool;
