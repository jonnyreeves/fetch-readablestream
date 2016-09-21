export function drainResponse(response) {
  const chunks = [];
  const reader = response.body.getReader();

  function pump() {
    return reader.read()
        .then(({ done, value }) => {
          if (done) {
            return chunks
          }
          chunks.push(value);
          return pump();
        })
  }
  return pump();
}

export function decodeUnaryJSON(chunks) {
  return new Promise((resolve) => resolve(JSON.parse(decodeResponse(chunks))))
}

function decodeResponse(chunks) {
  const decoder = new TextDecoder();
  return chunks
      .map((bytes, idx) => {
        const isLastChunk = idx === (chunks.length - 1);
        return decoder.decode(bytes, { stream: !isLastChunk })
      })
      .join("");
}