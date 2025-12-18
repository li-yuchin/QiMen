import React, { useRef, useState } from 'react';

interface ResultDisplayProps {
  content: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfTargetRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  if (!content) return null;

  // Formatter that adapts styling based on whether it's for screen (Dark Mode) or PDF (Light Mode)
  const formatText = (text: string, isForPdf: boolean = false) => {
    // Styles configuration
    const styles = {
      headerClass: isForPdf 
        ? "text-amber-900 font-display text-xl mt-6 mb-3 font-bold border-b border-gray-300 pb-2"
        : "text-mystic-gold font-display text-xl md:text-2xl mt-6 mb-3 font-bold border-b border-mystic-700 pb-2",
      listClass: isForPdf
        ? "ml-4 pl-2 text-black my-1 list-disc marker:text-amber-700"
        : "ml-4 pl-2 text-gray-300 my-1 list-disc marker:text-mystic-gold",
      pClass: isForPdf
        ? "text-black leading-relaxed mb-2 font-serif text-justify"
        : "text-gray-300 leading-relaxed mb-2 font-serif",
      strongHtml: isForPdf
        ? '<strong class="text-amber-700 font-bold">$1</strong>'
        : '<strong class="text-mystic-goldLight font-bold">$1</strong>'
    };

    return text.split('\n').map((line, index) => {
      // Headers
      if (line.trim().startsWith('#')) {
        const headerText = line.replace(/^#+\s*/, '');
        return (
          <h3 key={index} className={styles.headerClass}>
            {headerText}
          </h3>
        );
      }
      
      // List items
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <li key={index} className={styles.listClass}>
            <span dangerouslySetInnerHTML={{ 
              __html: line.replace(/^[*-]\s*/, '').replace(/\*\*(.*?)\*\*/g, styles.strongHtml) 
            }} />
          </li>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Paragraphs
      return (
        <p key={index} className={styles.pClass}>
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
    <title>奇門遁甲．軍師策論結果</title>
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
    <h1>奇門遁甲．軍師策論</h1>
    ${contentRef.current.innerHTML}
    <div class="footer">
        <p>"天時不如地利，地利不如人和。此策僅供參考，決策仍在人心。"</p>
        <p>${new Date().toLocaleString()}</p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Qimen_Strategy_${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePDF = async () => {
    if (!pdfTargetRef.current || isPdfGenerating) return;
    
    // Check if library loaded
    if (typeof (window as any).html2pdf === 'undefined') {
        alert("PDF 生成組件尚未載入，請稍候再試或重新整理頁面。");
        return;
    }

    setIsPdfGenerating(true);

    const element = pdfTargetRef.current;
    const opt = {
      margin:       10,
      filename:     `Qimen_Strategy_${new Date().toISOString().slice(0,10)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, // Higher scale for better quality
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await (window as any).html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("PDF Generation Error:", error);
        alert("PDF 生成失敗，請重試。");
    } finally {
        setIsPdfGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-fade-in print:hidden">
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <button 
          onClick={handleDownloadHTML}
          className="flex items-center gap-2 px-4 py-2 bg-mystic-800 hover:bg-mystic-700 text-mystic-gold border border-mystic-700 rounded transition-all text-sm font-serif"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下載 HTML
        </button>
        
        <button 
          onClick={handleSavePDF}
          disabled={isPdfGenerating}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mystic-gold to-amber-600 hover:from-amber-500 hover:to-amber-700 text-mystic-900 font-bold rounded shadow-lg transition-all text-sm font-serif ${isPdfGenerating ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isPdfGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-mystic-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成 PDF 中...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              存為 PDF
            </>
          )}
        </button>
      </div>

      {/* Main Display (Screen / Dark Mode) */}
      <div className="bg-mystic-800 border-t-4 border-mystic-gold rounded-lg shadow-2xl overflow-hidden relative">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-white/10 rounded-tl-lg pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-white/10 rounded-br-lg pointer-events-none"></div>

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
              "天時不如地利，地利不如人和。此策僅供參考，決策仍在人心。"
            </p>
          </div>
        </div>
      </div>

      {/* HIDDEN PDF TEMPLATE (Print / Light Mode) */}
      {/* This element is rendered off-screen specifically for html2pdf to grab */}
      <div style={{ position: 'absolute', top: 0, left: '-9999px', width: '210mm' }}>
         <div ref={pdfTargetRef} className="bg-white text-black p-[20mm] font-serif min-h-[297mm]">
            <div className="text-center border-b-2 border-amber-600 pb-6 mb-8">
               <h1 className="text-3xl font-bold text-amber-900 font-display tracking-widest">
                 奇門遁甲．時空戰略軍師
               </h1>
               <div className="mt-2 text-sm text-gray-500 uppercase tracking-widest">Strategic Decision Analysis</div>
            </div>

            <div className="text-[11pt] leading-relaxed text-justify">
               {formatText(content, true)}
            </div>

            <div className="mt-16 pt-4 border-t border-gray-300 flex justify-between items-center text-xs text-gray-400">
               <span>AI Powered Qi Men Dun Jia</span>
               <span>{new Date().toLocaleString()}</span>
            </div>
         </div>
      </div>

    </div>
  );
};

export default ResultDisplay;