
import React, { useRef, useState } from 'react';

interface ResultDisplayProps {
  content: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfTargetRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  if (!content) return null;

  const formatText = (text: string, isForPdf: boolean = false) => {
    const styles = {
      headerClass: (isFirst: boolean) => isForPdf 
        ? `${isFirst ? 'mt-0' : 'mt-8'} text-amber-900 font-display text-xl mb-3 font-bold border-b border-gray-300 pb-2`
        : "text-mystic-gold font-display text-xl md:text-2xl mt-6 mb-3 font-bold border-b border-mystic-700 pb-2",
      listClass: isForPdf
        ? "ml-4 pl-2 text-black my-1 list-disc marker:text-amber-700"
        : "ml-4 pl-2 text-gray-300 my-1 list-disc marker:text-mystic-gold",
      pClass: isForPdf
        ? "text-black leading-relaxed mb-4 font-serif text-justify text-[11pt]"
        : "text-gray-300 leading-relaxed mb-2 font-serif",
      strongHtml: isForPdf
        ? '<strong class="text-amber-700 font-bold">$1</strong>'
        : '<strong class="text-mystic-goldLight font-bold">$1</strong>',
      // PDF 專用的分頁規避樣式
      pdfAvoidBreak: { pageBreakInside: 'avoid' as const, breakInside: 'avoid-page' as const }
    };

    let headerCount = 0;
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('#')) {
        const headerText = line.replace(/^#+\s*/, '');
        const isFirst = headerCount === 0;
        headerCount++;
        return (
          <h3 key={index} className={styles.headerClass(isFirst)} style={isForPdf ? styles.pdfAvoidBreak : {}}>
            {headerText}
          </h3>
        );
      }
      
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <li key={index} className={styles.listClass} style={isForPdf ? styles.pdfAvoidBreak : {}}>
            <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/^[*-]\s*/, '').replace(/\*\*(.*?)\*\*/g, styles.strongHtml) 
            }} />
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className={styles.pClass} style={isForPdf ? styles.pdfAvoidBreak : {}}>
           <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/\*\*(.*?)\*\*/g, styles.strongHtml) 
            }} />
        </p>
      );
    });
  };

  const handleDownloadHTML = () => {
    if (!contentRef.current) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <title>奇門遁甲．軍師策論</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Noto Serif TC', serif; background-color: #fdfbf7; color: #1a202c; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; }
        h1 { text-align: center; color: #854d0e; border-bottom: 2px solid #d4af37; padding-bottom: 20px; }
        h3 { color: #854d0e; border-bottom: 1px solid #cbd5e1; margin-top: 30px; font-size: 1.25rem; }
        strong { color: #b45309; }
        .footer { margin-top: 60px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 0.875rem; }
    </style>
</head>
<body>
    <h1>軍師策論．時空推演</h1>
    ${contentRef.current.innerHTML}
    <div class="footer">
        <p>"知命不懼，日新其德。策論僅供參考，未來在您掌中。"</p>
        <p>${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Consult_Report_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePDF = async () => {
    if (!pdfTargetRef.current || isPdfGenerating) return;
    setIsPdfGenerating(true);

    const element = pdfTargetRef.current;
    const opt = {
      margin: [15, 15, 15, 15], // 上左下右留白，確保不會貼邊
      filename: `Consult_Report_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, // 縮小比例以平衡檔案大小與清晰度
        useCORS: true, 
        scrollY: 0, 
        scrollX: 0, 
        windowWidth: 800,
        letterRendering: true // 提升文字渲染品質
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // 強制避開跨頁截斷
    };

    try {
        await (window as any).html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("PDF 生成失敗。");
    } finally {
        setIsPdfGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in print:hidden">
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <button 
          onClick={handleDownloadHTML}
          className="flex items-center gap-2 px-4 py-2 bg-mystic-800 hover:bg-mystic-700 text-mystic-gold border border-mystic-700 rounded transition-all text-sm font-serif"
        >
          下載 HTML
        </button>
        <button 
          onClick={handleSavePDF}
          disabled={isPdfGenerating}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-amber-500 hover:to-amber-700 text-mystic-900 font-bold rounded shadow-lg transition-all text-sm font-serif ${isPdfGenerating ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isPdfGenerating ? "生成 PDF 中..." : "存為 PDF"}
        </button>
      </div>

      <div className="bg-mystic-800 border-t-4 border-mystic-gold rounded-lg shadow-2xl overflow-hidden relative">
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-center mb-8">
            <div className="h-px w-12 bg-mystic-gold/50"></div>
            <h2 className="mx-4 text-2xl font-display text-mystic-gold tracking-widest text-center">
              軍師策論
            </h2>
            <div className="h-px w-12 bg-mystic-gold/50"></div>
          </div>
          <div ref={contentRef} className="prose prose-invert prose-lg max-w-none">
            {formatText(content, false)}
          </div>
          <div className="mt-12 pt-6 border-t border-mystic-700 text-center">
            <p className="text-sm text-gray-500 font-serif italic">
              "知命不懼，日新其德。策論僅供參考，未來在您掌中。"
            </p>
          </div>
        </div>
      </div>

      {/* PDF 隱藏渲染目標 - 優化寬度與內邊距 */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '190mm' }}>
         <div ref={pdfTargetRef} className="bg-white text-black font-serif" style={{ width: '190mm', padding: '10mm' }}>
            <div className="text-center border-b-2 border-amber-600 pb-6 mb-8">
               <h1 className="text-3xl font-bold text-amber-900 font-display tracking-widest">
                 奇門遁甲．軍師策論
               </h1>
            </div>
            <div className="text-[11pt] leading-relaxed text-justify">
               {formatText(content, true)}
            </div>
            <div className="mt-20 pt-10 border-t border-gray-200 text-center text-gray-400 text-xs">
               <p>"知命不懼，日新其德。策論僅供參考，未來在您掌中。"</p>
               <p className="mt-2">{new Date().toLocaleString()}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
