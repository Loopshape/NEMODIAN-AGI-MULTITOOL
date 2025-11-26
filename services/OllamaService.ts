export const OllamaService = {
  stream: (prompt: string, onToken: (token: string) => void) => {
    const tokens = prompt.split("").map((c) => c + "_O");
    let i = 0;
    const interval = setInterval(() => {
      if (i >= tokens.length) return clearInterval(interval);
      onToken(tokens[i]);
      i++;
    }, 150);
    return { cancel: () => clearInterval(interval) };
  }
};

