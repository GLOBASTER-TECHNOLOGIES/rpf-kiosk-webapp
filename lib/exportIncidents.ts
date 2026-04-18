import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export type IncidentForExport = {
  _id?: string;
  id?: string;
  type?: string | null;
  issue_type?: string | null;
  station?: string | null;
  status?: string | null;
  officer?: string | null;
  phone_number?: string | null;
  date?: string | null;
  createdAt?: string | null;
  timetaken?: string | null;
};

export async function exportIncidentsAsPDF(
  incidents: IncidentForExport[],
  opts?: { filename?: string; title?: string; logoUrl?: string },
) {
  const filename = opts?.filename ?? "Incidents_Report.pdf";
  const title = opts?.title ?? "Incident Report";
  const logoUrl = opts?.logoUrl ?? "/rpf_logo.png";

  const doc = new jsPDF("p", "pt");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let logoImg: string | null = null;
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    const reader = new FileReader();
    logoImg = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {}

  const sortedIncidents = [...incidents].sort((a, b) => {
    const da = new Date(a.date ?? a.createdAt ?? 0).getTime();
    const db = new Date(b.date ?? b.createdAt ?? 0).getTime();
    return db - da;
  });

  const ITEMS_PER_PAGE = 20;
  const incidentChunks = [];
  for (let i = 0; i < sortedIncidents.length; i += ITEMS_PER_PAGE) {
    incidentChunks.push(sortedIncidents.slice(i, i + ITEMS_PER_PAGE));
  }

  let currentY = 0;

  incidentChunks.forEach((chunk, chunkIndex) => {
    if (chunkIndex > 0) doc.addPage();

    if (logoImg) doc.addImage(logoImg, "PNG", 40, 30, 60, 60);

    doc.setFont("helvetica", "bold").setFontSize(18).setTextColor("#0b2c64");
    doc.text("RPF Assistance Management System", 120, 55);
    doc.setFont("helvetica", "normal").setFontSize(14).setTextColor("#333");
    doc.text(title, 120, 75);
    doc.setFontSize(10).setTextColor("#666");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 120, 92);
    doc.setDrawColor(11, 44, 100).line(40, 105, pageWidth - 40, 105);

    currentY = 125;

    if (chunkIndex === 0) {
      // const introText = "Srirangam is a temple town situated within Trichinapally city. Srirangam station is a NSG-5 station with no presence of RPF & GRP with average 20 trains are plying daily having daily footfall of approximately 2000 passengers.";
      const introText = "";
      const splitIntro = doc.splitTextToSize(introText, pageWidth - 80);
      doc.setFontSize(10).setTextColor("#000").text(splitIntro, 40, currentY);
      currentY += doc.getTextDimensions(splitIntro).h + 20;
      
      doc.setFont("helvetica", "bold").setFontSize(12);
      doc.text(`Total Incidents: ${sortedIncidents.length}`, 40, currentY);
      currentY += 15;
    }

    const tableColumn = ["Si No", "Type", "Station", "Phone Number", "Date", "Officer", "Time"];
    const tableRows = chunk.map((i, index) => {
      const d = new Date(i.date ?? i.createdAt ?? "");
      const dateStr = Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const timeStr = Number.isNaN(d.getTime()) ? "-" : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      const globalSiNo = (chunkIndex * ITEMS_PER_PAGE) + (index + 1);
      return [globalSiNo, i.type ?? i.issue_type ?? "-", i.station ?? "-", i.phone_number ?? "-", dateStr, i.officer ?? "-", timeStr];
    });

    autoTable(doc, {
      startY: currentY,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [11, 44, 100], textColor: [255, 255, 255], halign: "left" },
      styles: { fontSize: 8.5, cellPadding: 5, halign: "left", valign: "middle" },
      columnStyles: { 0: { cellWidth: 40 } },
      margin: { left: 40, right: 40 },
      didDrawPage: (data) => {
        currentY = data.cursor ? data.cursor.y : currentY;
      }
    });
  });

  /* =========================
      SUMMARY TABLE (HORIZONTAL)
  ========================== */
  const summaryMap: Record<string, number> = {};
  sortedIncidents.forEach((inc) => {
    const type = inc.type ?? inc.issue_type ?? "Other";
    summaryMap[type] = (summaryMap[type] || 0) + 1;
  });

  const summaryHeaders = Object.keys(summaryMap);
  const summaryValues = Object.values(summaryMap);

  if (currentY + 120 > pageHeight) {
    doc.addPage();
    currentY = 60;
  } else {
    currentY += 40;
  }

  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor("#0b2c64");
  doc.text("Incident Summary", 40, currentY);

  autoTable(doc, {
    startY: currentY + 15,
    head: [summaryHeaders],
    body: [summaryValues], 
    theme: "grid",
    headStyles: { 
      fillColor: [11, 44, 100], 
      textColor: [255, 255, 255], 
      fontSize: 10,
      halign: 'center',
      valign: 'middle'
    },
    styles: { 
      fontSize: 10, 
      cellPadding: 8, 
      halign: "center", 
      valign: 'middle'
    },
    margin: { left: 40, right: 40 },
    didDrawPage: (data) => {
        currentY = data.cursor ? data.cursor.y : currentY;
    }
  });

  /* =========================
      CENTERED CLOSING STATEMENT (UPDATED)
  ========================== */
  // Added Asterisk (*) at the start
  const closingText = "* All reported incidents were promptly addressed by the duty officers, who handled each situation in accordance with established safety protocols and operational guidelines.";
  
  if (currentY + 100 > pageHeight) {
    doc.addPage();
    currentY = 100;
  } else {
    currentY += 50;
  }

  // Reduced Font Size to 11
  doc.setFont("helvetica", "bolditalic").setFontSize(11).setTextColor("#444");
  
  const splitClosing = doc.splitTextToSize(closingText, pageWidth - 120);
  doc.text(splitClosing, pageWidth / 2, currentY, { align: "center" });

  /* =========================
      FOOTER
  ========================== */
  const finalPageCount = doc.getNumberOfPages();
  for (let i = 1; i <= finalPageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9).setTextColor("#888");
    doc.text(`Page ${i} of ${finalPageCount}`, pageWidth - 40, pageHeight - 30, { align: "right" });
  }

  doc.save(filename);
}

export function exportIncidentsAsExcel(
  incidents: IncidentForExport[],
  opts?: { filename?: string },
) {
  const filename = opts?.filename ?? "Incidents_Report.xlsx";
  const sortedIncidents = [...incidents].sort((a, b) => {
    const da = new Date(a.date ?? a.createdAt ?? 0).getTime();
    const db = new Date(b.date ?? b.createdAt ?? 0).getTime();
    return db - da;
  });

  const worksheetData = sortedIncidents.map((i, index) => ({
    "Si No": index + 1,
    Type: i.type ?? i.issue_type ?? "-",
    Station: i.station ?? "-",
    "Phone Number": i.phone_number ?? "-",
    Officer: i.officer ?? "-",
    Date: formatDate(i.date ?? i.createdAt),
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");
  XLSX.writeFile(workbook, filename);
}