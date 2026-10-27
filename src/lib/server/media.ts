export const MAX_MEDIA_BYTES = 3 * 1024 * 1024;
export const fileTypes = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "audio/mpeg": "mp3",
  "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/ogg": "ogg", "audio/wav": "wav",
  "audio/x-wav": "wav", "audio/webm": "webm",
} as const;
export function mediaExtension(type: string, data: Buffer) {
  const ext = fileTypes[type as keyof typeof fileTypes];
  const head = data.subarray(0, 16);
  const matches = {
    jpg: head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff,
    png: head.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    webp: head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP",
    mp3: head.toString("ascii", 0, 3) === "ID3" || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0),
    m4a: head.toString("ascii", 4, 8) === "ftyp", ogg: head.toString("ascii", 0, 4) === "OggS",
    wav: head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WAVE",
    webm: head.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
  };
  return ext && matches[ext] ? ext : null;
}
