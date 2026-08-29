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

export class MockAIProvider implements AIProvider {
  async generateCompletion(
    messages: LLMMessage[],
    _options?: LLMCompletionOptions
  ): Promise<LLMCompletionResult> {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "";

    return {
      content: `[AI Explanation Layer Response]: Analysis completed for query: "${lastUserMessage.slice(
        0,
        50
      )}". All underlying calculations were executed deterministically by backend services.`,
      usage: { promptTokens: 50, completionTokens: 25 },
    };
  }
}

export function getAIProvider(): AIProvider {
  const providerType = process.env.AI_PROVIDER || "mock";
  
  switch (providerType) {
    case "mock":
    default:
      return new MockAIProvider();
  }
}
