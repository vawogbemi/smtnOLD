import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ReferenceData ={
  references?: {
    id: number;
    customers?: { name: string; phone: string };
    receivers?: { name: string; phone: string };
    description?: string;
    notes?: string;
    total_weight?: number;
    paid?: boolean;
    shipment?: number;
    shipping?: number;
    clearance?: number;
  };
  number: number;
}

export function generateManifestPDF(data: ReferenceData[]) {
  const doc = new jsPDF("landscape");

  const tableHeaders = [
    "Number",
    "Sender",
    "Receiver",
    "Description",
    "Notes",
    "Total Weight",
    "Paid",
  ];
  const tableData: (string | number)[][] = [];
  const visited: number[] = [];

  data.forEach((element) => {
    if (!element.references || visited.includes(element.references.id)) return;
    visited.push(element.references.id);

    const filteredData = data.filter(
      (row) => row.references?.id === element.references?.id
    );

    tableData.push([
      `${
        filteredData.reduce((a, b) => (a.number < b.number ? a : b)).number
      } - ${
        filteredData.reduce((a, b) => (a.number > b.number ? a : b)).number
      }`,
      `${element.references.customers?.name ?? "Unknown"} (${
        element.references.customers?.phone ?? "Unknown"
      })`,
      `${element.references.receivers?.name ?? "Unknown"} (${
        element.references.receivers?.phone ?? "Unknown"
      })`,
      element.references.description ?? "Unknown",
      element.references.notes ?? "Unknown",
      element.references.total_weight ?? "Unknown",
      element.references.paid
        ? ""
        : `Shipping: ${element.references.shipping} Clearance: ${element.references.clearance}` ??
          "Unknown",
    ]);
  });

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    styles: { minCellHeight: 20 },
  });

  doc.save(`manifest_${data[0].references?.shipment}.pdf`);
}