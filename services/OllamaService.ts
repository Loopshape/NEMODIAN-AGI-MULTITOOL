export const OllamaService = {
  checkStatus: async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      return response.ok;
    } catch (error) {
      console.error("Ollama server not running:", error);
      return false;
    }
  },

  stream: (prompt: string, onToken: (token: string) => void) => {
    const tokens = prompt.split("").map((c) => c + "_O");
    let i = 0;
    let interval: NodeJS.Timeout;
    let cancelled = false;

    const promise = new Promise<void>((resolve) => {
      interval = setInterval(() => {
        if (cancelled || i >= tokens.length) {
          clearInterval(interval);
          resolve();
          return;
        }
        onToken(tokens[i]);
        i++;
      }, 50); // Reduced interval for faster "streaming"
    });

    return {
      cancel: () => {
        cancelled = true;
        if (interval) clearInterval(interval);
      },
      promise: promise,
    };
  },
};

