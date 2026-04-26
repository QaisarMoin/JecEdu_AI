/**
 * Utility to print a specific element by ID
 */
export const printElement = (elementId, title = "Timetable") => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`printElement: No element found with id "${elementId}"`);
    return;
  }

  // Clone the element so we never touch the original DOM
  const cloned = element.cloneNode(true);

  // Remove any "no-print" or action buttons from the clone
  cloned.querySelectorAll(".no-print, .no-print-button").forEach((el) => el.remove());

  // Collect all accessible stylesheets from current page
  const collectedStyles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        // Cross-origin stylesheets — skip safely
        return "";
      }
    })
    .join("\n");

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert(
      "Popup was blocked. Please allow popups for this site and try again."
    );
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>

        <style>
          /* ── Collected page styles (Tailwind etc.) ── */
          ${collectedStyles}
        </style>

        <style>
          /* ── Base reset for print window ── */
          *, *::before, *::after {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 20px;
            background: #ffffff;
            font-family: ui-sans-serif, system-ui, -apple-system,
              BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
              Arial, sans-serif;
          }

          /* ── Force colours to print ── */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ── Tailwind print-variant overrides ─────────────────────────
             Tailwind compiles  print:block  →  @media print { .print\:block }
             but the new window has NO media query active until actual print.
             We force them visible here so the preview looks correct too.   */
          .print\:block  { display: block  !important; }
          .print\:hidden { display: none   !important; }
          .print\:p-0    { padding: 0      !important; }

          /* ── Hide interactive / screen-only elements ── */
          .no-print,
          .no-print-button,
          button {
            display: none !important;
          }

          /* ── Table layout ── */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          th, td {
            border: 1px solid #e5e7eb !important;
            word-wrap: break-word !important;
          }

          /* ── Cell height: auto so content never clips ── */
          .h-20, .h-24 {
            height: auto !important;
            min-height: 50px !important;
          }

          /* ── Hover / opacity effects should not affect print ── */
          .opacity-0 {
            opacity: 0 !important;
          }

          /* ── @page settings ── */
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          @media print {
            body {
              padding: 0 !important;
              margin: 0 !important;
            }

            table {
              font-size: 9pt !important;
            }

            th, td {
              padding: 5px !important;
            }
          }
        </style>
      </head>

      <body>
        ${cloned.outerHTML}

        <script>
          /*
           * We wait for all resources (especially any inline images / fonts)
           * to settle, then print.
           * We do NOT call window.close() here — closing the child window
           * from inside itself can freeze the PARENT tab in some browsers.
           * The user closes the print tab themselves after printing.
           */
          window.addEventListener("load", function () {
            setTimeout(function () {
              window.focus();  // ensure print dialog targets this window
              window.print();
            }, 400);
          });
        </script>
      </body>
    </html>
  `);

  // Must call close() on document (not window) to finish writing
  printWindow.document.close();
};