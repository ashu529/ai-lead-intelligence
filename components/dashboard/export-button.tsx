"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lead } from "@/lib/types/lead";
import { exportLeadsToCSV, exportLeadsToJSON } from "@/lib/utils";
import { Download, FileSpreadsheet, FileCode } from "lucide-react";

interface ExportButtonProps {
  leads: Lead[];
}

export function ExportButton({ leads }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExportCSV = () => {
    exportLeadsToCSV(leads);
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    exportLeadsToJSON(leads);
    setIsOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={leads.length === 0}
        style={{ gap: 6 }}
      >
        <Download size={13} style={{ color: "var(--text-secondary)" }} />
        Export
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            width: 168,
            background: "white",
            border: "1px solid var(--border-main)",
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          <button
            onClick={handleExportCSV}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--text-secondary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-main)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FileSpreadsheet size={14} style={{ color: "#16a34a" }} />
            Export to CSV
          </button>
          <button
            onClick={handleExportJSON}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--text-secondary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              borderTop: "1px solid var(--border-main)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-main)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FileCode size={14} style={{ color: "#2563eb" }} />
            Export to JSON
          </button>
        </div>
      )}
    </div>
  );
}
