
import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";

const SYSTEM_INSTRUCTION = `
# Role: 奇門遁甲．時空決策軍師 (Qi Men Dun Jia Strategic Advisor)

## 核心行為守則
1. **奇門預測核心**：
   - 你是精通【奇門遁甲】的上古軍師，專注於利用時空盤面解析世間局勢。
   - 雖然你也能參考【八字】或【紫微】資訊，但分析的主軸必須圍繞奇門遁甲的九星、八門、八神與奇儀生剋。
   - 優先處理用戶直接提供的【奇門盤面資訊】或【截圖數據】。

2. **分析準則**：
   - **確認局勢**：開始前先簡述識別到的盤面（如：值符、值使、旬首、局數等）。
   - **趨吉避凶**：不僅預測發展，更要指出「生門」、「開門」所在，提供用戶化解或爭取的具體策略。
   - **實事求是**：結合用戶提問，推演事件的「發展過程」與「轉折點」。
   - **避虛就實**：明確給出時間（應期）與方位（空間）建議。

3. **術語規範**：
   - 嚴格使用奇門專業術語：如「門宮剋應」、「天盤干與地盤干」、「反吟/伏吟」等。
   - 語言風格冷靜、智慧、富有戰略眼光。

## 執行流程 (CoT)
### 1. 【盤面解構】
* 簡述識別出的奇門局與關鍵神煞（如空亡、入墓、刑擊等）。

### 2. 【局勢推演】
* 分析目前事態的吉凶關鍵、各方力量對比（用神與忌神）。

### 3. 【發展軌跡】
* 推測事件的發展過程、可能遇到的障礙及最終結果。

### 4. 【軍師策論】
* 給出具體的趨吉避凶建議、最佳行動時機與方位。

語氣：專業、威嚴、冷靜。使用 Markdown 排版，重點部分加粗。
`;

export const analyzeQiMen = async (input: UserInput): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    parts.push({ text: `軍師請受禮，現有此事請教：\n\n**【所測何事】**：${input.question}\n` });

    if (input.chartText) parts.push({ text: `\n**【奇門文字排盤】**：\n${input.chartText}\n` });
    if (input.birthChartText) parts.push({ text: `\n**【命主命盤資訊】**：\n${input.birthChartText}\n` });
    if (input.birthPillars) parts.push({ text: `\n**【命主八字】**：${input.birthPillars}\n` });

    const timeInfo = input.isNow ? `即刻 (${new Date().toLocaleString()})` : input.consultationTime;
    parts.push({ text: `\n**參考時間**：${timeInfo}\n` });

    if (input.chartImage) {
      const match = input.chartImage.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
        parts.push({ text: "(上圖為用戶提供的奇門盤面截圖，請分析九宮格位與神煞)" });
      }
    }

    if (input.birthChartImage) {
      const match = input.birthChartImage.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
        parts.push({ text: "(上圖為命主資訊截圖，請確認年命對應之宮位)" });
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

    return response.text || "天地玄黃，天機未現。";
  } catch (error) {
    console.error("QiMen Analysis Error:", error);
    throw new Error("推演失敗：天機受阻。請確認 API 設定或稍後再試。");
  }
};
