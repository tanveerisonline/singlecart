"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { toast } from "sonner";

interface InvoiceDownloadButtonProps {
  order: any;
  userName: string;
}

export default function InvoiceDownloadButton({ order, userName }: InvoiceDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInvoice = async () => {
    try {
      setIsGenerating(true);
      
      const doc = new jsPDF() as any;
      const orderDate = format(new Date(order.createdAt), "MMM d, yyyy");
      const orderNumber = order.orderNumber || order.id.substring(0, 8);

      // Add Header
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.text("INVOICE", 105, 20, { align: "center" });

      // Add Order Details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Invoice To:", 20, 40);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text(userName, 20, 45);
      doc.setFont(undefined, "normal");
      doc.text(order.shippingAddress.street, 20, 50);
      doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, 20, 55);
      doc.text(order.shippingAddress.country, 20, 60);

      doc.setTextColor(100, 100, 100);
      doc.text("Invoice Details:", 140, 40);
      doc.setTextColor(0, 0, 0);
      doc.text(`Order ID: #${orderNumber}`, 140, 45);
      doc.text(`Date: ${orderDate}`, 140, 50);
      doc.text(`Status: ${order.status}`, 140, 55);
      doc.text(`Payment: ${order.paymentStatus}`, 140, 60);

      // Add Table
      const tableColumn = ["Product", "Price", "Quantity", "Total"];
      const tableRows = order.items.map((item: any) => [
        item.product.name,
        `$${item.price.toFixed(2)}`,
        item.quantity,
        `$${(item.price * item.quantity).toFixed(2)}`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: "striped",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      // Add Summary
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("Subtotal:", 140, finalY);
      doc.text(`$${(order.totalAmount - order.shippingCost).toFixed(2)}`, 180, finalY, { align: "right" });
      
      doc.text("Shipping Cost:", 140, finalY + 5);
      doc.text(`$${order.shippingCost.toFixed(2)}`, 180, finalY + 5, { align: "right" });

      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Grand Total:", 140, finalY + 15);
      doc.setTextColor(0, 0, 0);
      doc.text(`$${order.totalAmount.toFixed(2)}`, 180, finalY + 15, { align: "right" });

      // Add Footer
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for your business!", 105, 280, { align: "center" });

      // Download PDF
      doc.save(`invoice-${orderNumber}.pdf`);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Invoice Generation Error:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={generateInvoice}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-gray-200 disabled:bg-gray-400"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isGenerating ? "Generating..." : "Download Invoice"}
    </button>
  );
}
