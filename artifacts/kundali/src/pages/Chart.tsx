function downloadReport(name: string) {
  const reportEl = document.getElementById("kundali-report");

  if (!reportEl) {
    alert("Please generate kundali first.");
    return;
  }

  const oldStyle = document.getElementById("__print-override");
  if (oldStyle) oldStyle.remove();

  const style = document.createElement("style");
  style.id = "__print-override";

  style.textContent = `
    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    @media print {
      html,
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body * {
        visibility: hidden !important;
      }

      #kundali-report,
      #kundali-report * {
        visibility: visible !important;
      }

      #kundali-report {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        padding: 16px !important;
        background: #ffffff !important;
        color: #111111 !important;
      }

      .no-print {
        display: none !important;
      }

      .print-only {
        display: block !important;
        visibility: visible !important;
      }
    }
  `;

  document.head.appendChild(style);

  const origTitle = document.title;
  document.title = `${name.replace(/\s+/g, "_")}_Kundali`;

  setTimeout(() => {
    window.print();
    document.title = origTitle;

    setTimeout(() => {
      const el = document.getElementById("__print-override");
      if (el) el.remove();
    }, 1000);
  }, 100);
}
