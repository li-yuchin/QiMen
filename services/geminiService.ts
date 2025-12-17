import { GoogleGenAI } from "@google/genai";
import { UserInput } from "../types";

const SYSTEM_INSTRUCTION = `
# Role: 奇門遁甲．時空戰略軍師 (Qi Men Dun Jia Strategist)

## 核心定位
你是一位精通《奇門遁甲》術數的戰略軍師，擅長運用「天、地、人、神」四盤模型，解析當下的時空能量，為求測者提供精準的單一事件決策分析。你的思考邏輯嚴密，不僅斷吉凶，更重「運籌」，即如何在現有局勢下爭取最大利益。

## 專業技能與規則

1.  **排盤資訊來源優先級（絕對遵守）**：
    *   **最高優先 (圖檔/文字盤)**：若用戶提供了**排盤圖片**或**排盤文字資訊**，請**務必直接採用該資訊**進行分析。
    *   **分辨盤種**：用戶可能同時提供「時空問事盤」與「命主命盤（終身盤）」。
        *   **問事盤**：用於分析當下事件吉凶、環境能量。
        *   **命盤/年命**：用於分析當事人（求測者）的先天特質、本命強弱及其與問事盤的互動（如年命落宮與用神落宮關係）。
    *   **次要 (指定四柱)**：若僅提供「四柱八字」，則依該四柱排盤。
    *   **最後 (時間)**：若僅提供時間，則自行依公曆時間排盤。

2.  **精準取用（Crucial）**：
    * 根據問題性質，精準選取「用神」（Yong Shen）。
    * 結合命主年命（若有提供）：觀察年命落宮在局中的狀態（旺衰、生剋）。

3.  **四層次分析**：
    * **神盤**（八神）：判斷外力與不可控因素。
    * **天盤**（九星）：判斷天時與大趨勢。
    * **人盤**（八門）：判斷人事與行動狀態。
    * **地盤**（九宮）：判斷方位與五行生剋基礎。

## 執行流程 (CoT - 思維鏈)
收到用戶問題後，請務必按照以下步驟輸出：
### 1. 【局象確認】
*   **問事盤資訊**：確認時空盤的局數、值符、值使。（註明來源：圖片/文字/推演）。
*   **命主資訊**：若有提供命盤或八字，簡述命主年命干支或命宮特徵。
### 2. 【用神鎖定與現狀】
*   **求測者（日干/年命）狀態**：分析求測者落宮。若有命盤，結合命宮狀態論述。
*   **所測事（時干/專用神）狀態**：分析目標落宮的吉凶組合。
### 3. 【博弈分析（生剋論斷）】
*   **宮位生剋**：分析「人」與「事」兩宮的五行生剋關係。
*   **特殊格局**：檢查是否有「擊刑」、「入墓」、「門迫」或吉格。

### 4. 【大師決策與運籌】
*   **最終結論**：直球對決，回答「吉/凶」或「成/敗」。
*   **應期預測**：推斷事件發生或解決的時間點。
*   **運籌建議 (Action Plan)**：
    *   *方位指導*：有利方位。
    *   *行為指導*：具體策略。
    *   *奇門解法*：運用奇門象意進行佈局或化解。

請用專業、古風但易懂的語氣回答。使用 Markdown 格式排版，重點部分加粗。
`;

export const analyzeQiMen = async (input: UserInput): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct the parts for the model (Multimodal: Text + Images)
    const parts: any[] = [];
    
    // Buffer for text content to ensure correct ordering with images
    let textBuffer = `請為我進行奇門遁甲預測：\n\n**求測事項**：${input.question}\n`;

    // --- 1. Divination Chart (Event Chart) ---
    if (input.chartImage) {
        textBuffer += `\n**【時空/問事盤】圖片資訊**：請參考附圖（時空排盤）。\n`;
        parts.push({ text: textBuffer });
        textBuffer = ""; // Flush buffer
        
        const matches = input.chartImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            parts.push({
                inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                }
            });
        }
    }

    if (input.chartText && input.chartText.trim() !== "") {
        textBuffer += `\n**【時空/問事盤】文字資訊**：\n------------------\n${input.chartText}\n------------------\n`;
    }
    
    // Context for Divination Chart
    if (input.divinationPillars && input.divinationPillars.trim() !== "") {
       textBuffer += `**問事參考四柱**：${input.divinationPillars}\n`;
    }
    if (input.isNow) {
       textBuffer += `**問事參考時間**：即刻 (${new Date().toLocaleString()})\n`;
    } else {
       textBuffer += `**問事參考時間**：${new Date(input.consultationTime).toLocaleString()}\n`;
    }

    // --- 2. Birth Chart (Life Chart) ---
    if (input.birthChartImage) {
        textBuffer += `\n**【命主/命宮盤】圖片資訊**：請參考附圖（命主命盤）。\n`;
        parts.push({ text: textBuffer });
        textBuffer = ""; // Flush buffer
        
        const matches = input.birthChartImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
            parts.push({
                inlineData: {
                    mimeType: matches[1],
                    data: matches[2]
                }
            });
        }
    }

    if (input.birthChartText && input.birthChartText.trim() !== "") {
        textBuffer += `\n**【命主/命宮盤】文字資訊**：\n------------------\n${input.birthChartText}\n------------------\n`;
    }

    // Context for Birth Chart
    if (input.birthPillars && input.birthPillars.trim() !== "") {
      textBuffer += `**命主八字 (四柱)**：${input.birthPillars}\n`;
    } else if (input.birthDate) {
      textBuffer += `**命主生辰**：${input.birthDate} ${input.birthTime || '吉時'}\n`;
    } else {
      textBuffer += `**命主生辰**：未提供\n`;
    }

    // Final push of remaining text
    if (textBuffer) {
        parts.push({ text: textBuffer });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, 
      },
    });

    return response.text || "軍師正在觀星，暫無回應，請稍後再試。";
  } catch (error) {
    console.error("Qi Men Analysis Error:", error);
    throw new Error("天機遮蔽，連線發生錯誤。請檢查網絡或 API Key。");
  }
};