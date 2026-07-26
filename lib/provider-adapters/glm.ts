import type { ProviderAdapter, AttemptCallResult, FileData } from "./types";

/**
 * GLM Adapter (Zhipu AI / BigModel).
 * Endpoint: https://open.bigmodel.cn/api/paas/v4/chat/completions
 * Model default: glm-4-flash
 */
export const glmAdapter: ProviderAdapter = {
  supportsVision: false,

  async call(
    apiKey: string,
    prompt: string,
    systemPrompt: string,
    options: { temperature?: number; max_tokens?: number; model_name?: string },
    _fileData?: FileData | null,
    _selectedKeyId?: string | null,
    _selectedKeyLabel?: string
  ): Promise<AttemptCallResult> {
    const model = options.model_name || "glm-4-flash";
    const messages = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2048,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          success: false,
          aiResponseText: "",
          promptTokens: 0,
          completionTokens: 0,
          errorMsg: `GLM API returned status ${res.status}: ${errText}`,
          status: res.status,
        };
      }

      const data = await res.json();
      const aiResponseText = data.choices?.[0]?.message?.content || "";
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;

      return {
        success: true,
        aiResponseText,
        promptTokens,
        completionTokens,
        errorMsg: "",
        status: 200,
      };
    } catch (err: any) {
      return {
        success: false,
        aiResponseText: "",
        promptTokens: 0,
        completionTokens: 0,
        errorMsg: err.message || "Network error calling GLM API",
        status: 500,
      };
    }
  },
};
