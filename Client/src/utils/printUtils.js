/**
 * Utility to print a specific element by ID or reference
 */
export const printElement = (elementId, title = "Timetable") => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  
  // Get all styles from the current document
  const stylesheets = Array.from(document.styleSheets).map(styleSheet => {
    try {
      return Array.from(styleSheet.cssRules).map(rule => rule.cssText).join('');
    } catch (e) {
      // Handle cross-origin styles
      return '';
    }
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${stylesheets}
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body { 
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
            .no-print { display: none !important; }
            table { 
              width: 100% !important; 
              border-collapse: collapse !important; 
              table-layout: fixed !important;
              font-size: 9pt !important;
            }
            th, td { 
              border: 1px solid #e5e7eb !important; 
              padding: 6px !important;
              word-wrap: break-word !important;
            }
            .h-20, .h-24 { height: auto !important; min-height: 50px !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
          body { 
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${element.innerHTML}
        </div>
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 500);
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};
