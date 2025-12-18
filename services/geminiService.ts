import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";

const SYSTEM_INSTRUCTION = `
# Role: 奇門遁甲．時空戰略軍師 (Qi Men Dun Jia Strategist)

## 核心行為守則
1. **絕對資料優先權**：
   - **第一優先**：用戶提供的【文字排盤】。若有提供，嚴禁使用公曆時間重新排盤。
   - **第二優先**：用戶輸入的【四柱八字】。依照此四柱進行推演。
   - **最後手段**：若僅提供時間，方可嘗試運算（需告知用戶 AI 運算可能存在誤差）。

2. **分析前置確認**：
   在開始分析前，必須先簡短列出你識別到的【局象關鍵資訊】（如：局數、值符、值使、日干宮位）。

3. **術語規範**：
   使用正統奇門術語，結合「天、地、人、神」四盤。

## 執行流程 (CoT)
### 1. 【局象驗證】
* 簡述識別出的盤面資訊（局數、排盤時間）。

### 2. 【格局剖析】
* 用神落宮、年命落宮、星門神儀之組合吉凶。

### 3. 【博弈論斷】
* 宮位生剋、奇門格局（如：青龍返首、辛加乙等）。

### 4. 【軍師決策】
* 吉凶結論、應期、具體運籌建議。

語氣：專業、沉穩、帶有古風。使用 Markdown 排版，重點部分加粗。
`;

export const analyzeQiMen = async (input: UserInput): Promise<string> => {
  try {
    // 使用系統預設且受支援的 API Key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    // 基礎事項資訊
    parts.push({ text: `請根據以下資訊進行預測與戰略推演：\n\n**事項**：${input.question}\n` });

    // 文字資料
    if (input.chartText) parts.push({ text: `\n**【提問時間/事件時間排盤文字】**：\n${input.chartText}\n` });
    if (input.birthChartText) parts.push({ text: `\n**【命主命盤文字】**：\n${input.birthChartText}\n` });
    if (input.birthPillars) parts.push({ text: `\n**【命主八字】**：${input.birthPillars}\n` });

    const timeInfo = input.isNow ? `即刻 (${new Date().toLocaleString()})` : input.consultationTime;
    parts.push({ text: `\n**參考時間**：${timeInfo}\n` });

    // 視覺影像資料處理 (Gemini 3 Pro 原生支援)
    if (input.chartImage) {
      const match = input.chartImage.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
        parts.push({ text: "(以上圖片為提問/事件之排盤截圖，請優先識別並分析其中的盤面佈局)" });
      }
    }

    if (input.birthChartImage) {
      const match = input.birthChartImage.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
        parts.push({ text: "(以上圖片為命主終身局之截圖，請優先識別其中的命宮與年命資訊)" });
      }
    }

    // 調用 Gemini 3 Pro，啟用 Thinking 功能以達到類似 DeepSeek R1 的推理效果
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 32768 } // 啟用深度推理預算
      },
    });

    return response.text || "軍師正在觀星，暫無回應。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("推演失敗：天機暫時無法窺視（請確認網路連線或 API Key 是否有效）。");
  }
};