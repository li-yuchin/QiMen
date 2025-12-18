import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";

const SYSTEM_INSTRUCTION = `
# Role: 奇門遁甲．時空戰略軍師 (Qi Men Dun Jia Strategist)

## 核心行為守則（避免計算誤差）
1. **絕對資料優先權**：
   - **第一優先**：用戶上傳的【排盤圖片】或【排盤文字】。若有提供，**嚴禁**使用公曆時間重新排盤。
   - **第二優先**：用戶輸入的【四柱八字】。依照此四柱進行推演。
   - **最後手段**：若用戶僅提供時間，方可嘗試運算（需告知用戶 AI 排盤可能存在誤差）。

2. **分析前置確認**：
   在開始分析前，必須先簡短列出你識別到的【局象關鍵資訊】（如：局數、值符、值使、日干宮位），若這部分與用戶提供的文字不符，請立即在回覆中提醒。

3. **術語規範**：
   使用正統奇門術語，結合「天、地、人、神」四盤。

## 執行流程 (CoT)
### 1. 【局象驗證】
* 簡述識別出的盤面資訊（來源：圖/文/推算）。

### 2. 【格局剖析】
* 用神落宮、年命落宮、星門神儀之組合吉凶。

### 3. 【博弈論斷】
* 宮位生剋、奇門格局（如：青龍返首、辛加乙等）。

### 4. 【軍師決策】
* 吉凶結論、應期、具體運籌建議。

語氣：專業、沉穩、帶有古風。Markdown 排版，重點部分加粗。
`;

export const analyzeQiMen = async (input: UserInput): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    
    let textBuffer = `請根據以下資訊進行預測。
**重要提醒**：若我有提供圖片或文字排盤，請以該資訊為準，不要自行運算。

**事項**：${input.question}\n`;

    // Priority 1: Images
    if (input.chartImage) {
        textBuffer += `\n**【問事盤圖片】**：(請分析此圖)\n`;
        const matches = input.chartImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            parts.push({ text: textBuffer });
            parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            textBuffer = "";
        }
    }
    if (input.birthChartImage) {
        textBuffer += `\n**【命主盤圖片】**：(請分析此圖)\n`;
        const matches = input.birthChartImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            if (textBuffer) parts.push({ text: textBuffer });
            parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
            textBuffer = "";
        }
    }

    // Priority 2: Text Charts
    if (input.chartText) textBuffer += `\n**【問事盤文字結果】**：\n${input.chartText}\n`;
    if (input.birthChartText) textBuffer += `\n**【命主盤文字結果】**：\n${input.birthChartText}\n`;

    // Priority 3: Pillars & Time
    if (input.divinationPillars) textBuffer += `**問事四柱**：${input.divinationPillars}\n`;
    if (input.birthPillars) textBuffer += `**命主八字**：${input.birthPillars}\n`;
    
    const timeInfo = input.isNow ? `即刻 (${new Date().toLocaleString()})` : input.consultationTime;
    textBuffer += `**參考時間**：${timeInfo}\n`;

    if (textBuffer) parts.push({ text: textBuffer });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more analytical consistency
      },
    });

    return response.text || "軍師正在觀星，暫無回應。";
  } catch (error) {
    console.error("Qi Men Error:", error);
    throw new Error("天機遮蔽，建議手動輸入排盤文字再試。");
  }
};