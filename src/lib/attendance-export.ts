interface StudentAttendanceRecord {
  firstName: string;
  lastName: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

interface AttendanceReportData {
  schoolName: string;
  schoolLogo?: string;
  className: string;
  classArm?: string;
  reportDate: string;
  startDate: string;
  endDate: string;
  students: StudentAttendanceRecord[];
  summary: {
    expectedPupils: number;
    recorded: number;
    present: number;
    absent: number;
    late: number;
    completion: number;
  };
}

export function generateCSV(data: AttendanceReportData): string {
  const headers = [
    "Student Name",
    "Present",
    "Absent",
    "Late",
    "Total Records",
    "Attendance %",
  ];

  const rows = data.students.map((student) => [
    `${student.firstName} ${student.lastName}`,
    student.present.toString(),
    student.absent.toString(),
    student.late.toString(),
    student.total.toString(),
    `${student.percentage.toFixed(1)}%`,
  ]);

  const summaryRows = [
    [],
    ["SUMMARY"],
    ["Expected Pupils", data.summary.expectedPupils.toString()],
    ["Recorded", data.summary.recorded.toString()],
    ["Present", data.summary.present.toString()],
    ["Absent", data.summary.absent.toString()],
    ["Late", data.summary.late.toString()],
    ["Completion %", `${data.summary.completion.toFixed(1)}%`],
  ];

  const allRows = [...rows, ...summaryRows];
  const csvContent = [
    `Attendance Report - ${data.className}${data.classArm ? ` ${data.classArm}` : ""}`,
    `Period: ${data.startDate} to ${data.endDate}`,
    `Generated: ${data.reportDate}`,
    `School: ${data.schoolName}`,
    "",
    headers.join(","),
    ...allRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ];

  return csvContent.join("\n");
}

export function generatePDF(data: AttendanceReportData): void {
  const printWindow = window.open("", "", "width=1200,height=800");
  if (!printWindow) return;

  const getStatusColor = (percentage: number): string => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 75) return "#f59e0b";
    return "#ef4444";
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; }
        .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
        .header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
        .logo { max-width: 120px; height: auto; border-radius: 16px; background: white; padding: 10px; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); }
        .header-content { flex: 1; }
        .header h1 { font-size: 28px; color: #0f172a; margin-bottom: 10px; }
        .header-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; color: #666; }
        .summary-section { 
          background: #f0f9ff; 
          border: 1px solid #bfdbfe; 
          border-radius: 8px; 
          padding: 20px; 
          margin-bottom: 30px; 
        }
        .summary-section h2 { font-size: 16px; margin-bottom: 15px; color: #0c4a6e; }
        .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .metric-box { 
          background: white; 
          border: 1px solid #dbeafe; 
          border-radius: 6px; 
          padding: 12px; 
          text-align: center; 
        }
        .metric-label { font-size: 11px; color: #0284c7; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #0f172a; }
        .metric-unit { font-size: 11px; color: #666; margin-top: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead { background: #1e40af; color: white; }
        th { 
          padding: 12px; 
          text-align: left; 
          font-weight: 600; 
          font-size: 12px; 
          border: 1px solid #1e40af; 
        }
        td { 
          padding: 10px 12px; 
          border: 1px solid #ddd; 
          font-size: 12px; 
        }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .status-excellent { background: #d1fae5; color: #065f46; font-weight: 600; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .status-good { background: #fef3c7; color: #78350f; font-weight: 600; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .status-poor { background: #fee2e2; color: #7f1d1d; font-weight: 600; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .footer { 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 1px solid #ddd; 
          font-size: 11px; 
          color: #999; 
          text-align: center; 
        }
        @media print { 
          body { margin: 0; background: white; }
          .container { padding: 20px; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${data.schoolLogo ? `<img class="logo" src="${data.schoolLogo}" alt="${data.schoolName} logo" />` : ""}
          <div class="header-content">
            <h1>Attendance Report</h1>
            <div class="header-info">
              <div><strong>School:</strong> ${data.schoolName}</div>
              <div><strong>Class:</strong> ${data.className}${data.classArm ? ` ${data.classArm}` : ""}</div>
              <div><strong>Period:</strong> ${data.startDate} to ${data.endDate}</div>
              <div><strong>Generated:</strong> ${data.reportDate}</div>
            </div>
          </div>
        </div>

        <div class="summary-section">
          <h2>Summary Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-box">
              <div class="metric-label">Expected Pupils</div>
              <div class="metric-value">${data.summary.expectedPupils}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Recorded</div>
              <div class="metric-value">${data.summary.recorded}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Completion</div>
              <div class="metric-value">${data.summary.completion.toFixed(1)}</div>
              <div class="metric-unit">%</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Present</div>
              <div class="metric-value" style="color: #10b981;">${data.summary.present}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Absent</div>
              <div class="metric-value" style="color: #ef4444;">${data.summary.absent}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Late</div>
              <div class="metric-value" style="color: #f59e0b;">${data.summary.late}</div>
            </div>
          </div>
        </div>

        <h2 style="margin-bottom: 15px; color: #0f172a; font-size: 16px;">Student Attendance Records</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 35%;">Student Name</th>
              <th style="width: 10%;">Present</th>
              <th style="width: 10%;">Absent</th>
              <th style="width: 10%;">Late</th>
              <th style="width: 10%;">Total</th>
              <th style="width: 20%;">Attendance %</th>
            </tr>
          </thead>
          <tbody>
            ${data.students
              .map(
                (student, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${student.firstName} ${student.lastName}</strong></td>
                <td style="text-align: center; color: #10b981; font-weight: 600;">${student.present}</td>
                <td style="text-align: center; color: #ef4444; font-weight: 600;">${student.absent}</td>
                <td style="text-align: center; color: #f59e0b; font-weight: 600;">${student.late}</td>
                <td style="text-align: center;">${student.total}</td>
                <td style="text-align: center;">
                  <span class="${
                    student.percentage >= 90
                      ? "status-excellent"
                      : student.percentage >= 75
                        ? "status-good"
                        : "status-poor"
                  }">
                    ${student.percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>This is an automatically generated report. For official records, please verify with the school administration.</p>
          <p>Generated at ${new Date().toLocaleString()}</p>
        </div>
      </div>

      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
