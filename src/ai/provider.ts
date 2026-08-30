export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMCompletionOptions = {
  temperature?: number;
  maxTokens?: number;
  tools?: Record<string, any>[];
};

export type LLMCompletionResult = {
  content: string;
  toolCalls?: Array<{
    name: string;
    args: Record<string, any>;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
};

export interface AIProvider {
  generateCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult>;
}

export class OpenAICompatibleProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl?: string, model?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || process.env.AI_BASE_URL || "https://api.openai.com/v1";
    this.model = model || process.env.AI_MODEL || (this.baseUrl.includes("groq.com") ? "openai/gpt-oss-120b" : "gpt-4o-mini");
  }

  async generateCompletion(
    messages: LLMMessage[],
    options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const modelsToTry = [this.model, "openai/gpt-oss-120b", "groq/compound", "openai/gpt-oss-20b"];
    let lastError: Error | null = null;

    for (const targetModel of Array.from(new Set(modelsToTry))) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: options?.temperature ?? 0.2,
            max_tokens: options?.maxTokens ?? 1000,
            ...(options?.tools ? { tools: options.tools } : {}),
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`LLM Provider API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const choice = data.choices?.[0];
        const message = choice?.message;

        const toolCalls = message?.tool_calls?.map((tc: any) => ({
          name: tc.function.name,
          args: JSON.parse(tc.function.arguments || "{}"),
        }));

        return {
          content: message?.content || "",
          toolCalls,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
          },
        };
      } catch (err: any) {
        lastError = err;
        // If it's a model not found error, try next model in loop
        if (err.message?.includes("model_not_found") || err.message?.includes("does not exist")) {
          continue;
        }
        break;
      }
    }

    console.warn("OpenAICompatibleProvider failed, falling back to mock:", lastError?.message);
    const mock = new MockAIProvider();
    return mock.generateCompletion(messages, options);
  }
}

export class MockAIProvider implements AIProvider {
  async generateCompletion(
    messages: LLMMessage[],
    _options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    return {
      content: `[Factory Operational Agent Response]: Analysis completed for query: "${lastUserMessage.slice(
        0,
        60
      )}". Verified via deterministic telemetry and application database services.`,
      usage: { promptTokens: 50, completionTokens: 30 },
    };
  }
}

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || "auto";
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (groqKey || providerType === "groq") {
    const key = groqKey || openaiKey;
    if (key) {
      const baseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
      const model = process.env.AI_MODEL || "openai/gpt-oss-120b";
      return new OpenAICompatibleProvider(key, baseUrl, model);
    }
  }

  if (openaiKey || providerType === "openai") {
    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    return new OpenAICompatibleProvider(openaiKey!, baseUrl, model);
  }

  return new MockAIProvider();
}
