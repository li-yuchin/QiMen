
import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";

const SYSTEM_INSTRUCTION = `
# Role: 命理預測解盤師 (Fortune Prediction & Chart Interpreter)

## 核心行為守則
1. **多維度命理整合**：
   - 你具備【奇門遁甲】、【四柱八字】與【紫微斗數】的深厚造詣。
   - 能夠根據用戶提供的文字排盤（無論是哪種系統）或截圖，進行跨學科的綜合論斷。
   - 優先處理用戶直接提供的【排盤資訊】或【截圖數據】。

2. **分析準則**：
   - **確認資訊**：開始前先簡述識別到的盤面特徵（如：奇門局數、八字身強弱、紫微主星等）。
   - **實事求是**：結合用戶問題，給出具體的發展過程預測與應對策略。
   - **避虛就實**：不給予含糊的回答，盡可能指出具體的時間點（應期）或宮位影響。

3. **術語規範**：
   - 根據使用的命理系統（如奇門或八字）使用對應的專業術語。
   - 語言風格沉穩、客觀、且具有古風智慧。

## 執行流程 (CoT)
### 1. 【盤面識別】
* 簡述識別出的命盤類型與關鍵指標。

### 2. 【核心論斷】
* 分析目前局勢的吉凶關鍵、力量生剋對比。

### 3. 【趨勢預測】
* 推測事件的發展過程、轉折點與最終結果。

### 4. 【決策策略】
* 給出具體的建議、解厄之道或運籌策略。

語氣：專業、沉穩。使用 Markdown 排版，重點部分加粗。
`;

export const analyzeQiMen = async (input: UserInput): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    parts.push({ text: `請根據以下資訊進行命理預測與解盤：\n\n**用戶提問**：${input.question}\n` });

    if (input.chartText) parts.push({ text: `\n**【預測盤面文字資訊】**：\n${input.chartText}\n` });
    if (input.birthChartText) parts.push({ text: `\n**【命主命盤文字資訊】**：\n${input.birthChartText}\n` });
    if (input.birthPillars) parts.push({ text: `\n**【命主八字】**：${input.birthPillars}\n` });

    const timeInfo = input.isNow ? `即刻 (${new Date().toLocaleString()})` : input.consultationTime;
    parts.push({ text: `\n**參考時間**：${timeInfo}\n` });

    if (input.chartImage) {
      const match = input.chartImage.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
        parts.push({ text: "(上圖為用戶提供的預測盤面截圖，請分析其象義)" });
      }
    }

    if (input.birthChartImage) {
      const match = input.birthChartImage.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
        parts.push({ text: "(上圖為命主命盤截圖，請分析其年命與格位)" });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return response.text || "正在溝通天地，暫無回應。";
  } catch (error) {
    console.error("Interpreter Analysis Error:", error);
    throw new Error("推演失敗：目前連線不穩定，請確認 API 設定或稍後再試。");
  }
};
