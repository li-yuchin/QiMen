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
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key 未設定");

    let promptText = `請根據以下資訊進行預測。
**事項**：${input.question}\n`;

    // Handle inputs
    if (input.chartText) promptText += `\n**【排盤文字結果】**：\n${input.chartText}\n`;
    if (input.birthChartText) promptText += `\n**【命主命盤文字】**：\n${input.birthChartText}\n`;
    if (input.birthPillars) promptText += `\n**【命主八字】**：${input.birthPillars}\n`;
    
    // Note about images since DeepSeek-R1 is text-based currently
    if (input.chartImage || input.birthChartImage) {
      promptText += `\n*(注意：用戶已上傳圖片，但目前軍師優先分析文字資訊，請根據文字描述進行推演)*\n`;
    }

    const timeInfo = input.isNow ? `即刻 (${new Date().toLocaleString()})` : input.consultationTime;
    promptText += `\n**參考時間**：${timeInfo}\n`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-reasoner", // Use DeepSeek-R1 for deep reasoning
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: promptText }
        ],
        temperature: 0.3,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "呼叫 DeepSeek 失敗");
    }

    const data = await response.json();
    
    // DeepSeek-R1 returns content in choices[0].message.content
    // If we want reasoning_content, it's under message.reasoning_content
    const content = data.choices[0].message.content;
    const reasoning = data.choices[0].message.reasoning_content;

    // Optional: Prepend reasoning to the result for a "strategist's inner thought" feel
    if (reasoning) {
      return `> **軍師推演筆記**：\n> ${reasoning.split('\n').join('\n> ')}\n\n${content}`;
    }

    return content || "軍師正在觀星，暫無回應。";
  } catch (error) {
    console.error("DeepSeek Error:", error);
    throw new Error("天機遮蔽（API 連線失敗），請確認 API Key 是否有效或稍後再試。");
  }
};