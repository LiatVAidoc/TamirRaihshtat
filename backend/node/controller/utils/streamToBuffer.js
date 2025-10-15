/**
 * Converts a readable stream to a Buffer
 * @param {ReadableStream} stream - The readable stream to convert
 * @returns {Promise<Buffer>} - Promise that resolves to a Buffer
 */
export async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
