import { OLLAMA_BASE_URL, OLLAMA_DEFAULT_MODEL } from '../constants';

export const OllamaService = {
  checkStatus: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error("Ollama server not running:", error);
      return false;
    }
  },

  stream: (prompt: string, onToken: (token: string) => void) => {
    const controller = new AbortController();
    const signal = controller.signal;

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OLLAMA_DEFAULT_MODEL,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          }),
          signal,
        });

        if (!response.body) {
          reject(new Error("Response body is null"));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.substring(0, newlineIndex).trim();
            buffer = buffer.substring(newlineIndex + 1);

            if (line === '') continue;

            try {
              const json = JSON.parse(line);
              if (json.message && json.message.content) {
                onToken(json.message.content);
              }
            } catch (error) {
              console.error("Error parsing stream chunk:", error, "Line:", line);
            }
          }
        }
        resolve();
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
          resolve(); // Resolve silently on abort
        } else {
          console.error("Error during Ollama stream:", error);
          reject(error);
        }
      }
    });

    return {
      cancel: () => {
        controller.abort();
      },
      promise: promise,
    };
  },
};

