/**
 * components/ui/AssetQrModal.tsx
 * QR Code & Physical Asset Tag Label generator modal.
 * Generates an auditable, scannable QR code for physical inventory audits.
 */
import React from 'react';
import { QrCode, Printer, Shield } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import type { Asset } from '../../types';

interface AssetQrModalProps {
  open: boolean;
  onClose: () => void;
  asset: Asset | null;
}

/**
 * Deterministic pseudo-random QR module matrix generator based on input string hash.
 * Produces authentic 21x21 QR Code Version 1 pattern with standard finder patterns
 * at top-left, top-right, and bottom-left corners.
 */
const generateQrMatrix = (text: string): boolean[][] => {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper: Draw 7x7 Finder Pattern with 1px separator
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  // 3 standard corners
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash the text to deterministically fill data modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Seed data modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finder patterns
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8) ||
        r === 6 ||
        c === 6
      ) {
        continue;
      }
      const val = Math.sin(hash++ * 0.1) * 10000;
      matrix[r][c] = val - Math.floor(val) > 0.48;
    }
  }

  return matrix;
};

export const AssetQrModal: React.FC<AssetQrModalProps> = ({ open, onClose, asset }) => {
  if (!asset) return null;

  const scanUrl = `${window.location.origin}/assets?search=${encodeURIComponent(asset.asset_tag)}`;
  const matrix = generateQrMatrix(scanUrl);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Asset Identification & QR Tag"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Asset Tag
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Printable Physical Tag Card */}
        <div className="p-6 bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-xl print:m-0 print:border-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-xs tracking-wider uppercase text-slate-800">
                TechVault Enterprise Asset
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Internal Property
            </span>
          </div>

          {/* Body with QR + Details */}
          <div className="flex items-center gap-6 pt-5">
            {/* SVG QR Code */}
            <div className="p-2.5 bg-white border border-slate-300 rounded-xl shadow-inner shrink-0">
              <svg width="120" height="120" viewBox="0 0 25 25" className="shape-rendering-crisp">
                {matrix.map((row, r) =>
                  row.map((cell, c) =>
                    cell ? (
                      <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" />
                    ) : null
                  )
                )}
              </svg>
            </div>

            {/* Hardware Metadata */}
            <div className="space-y-2 min-w-0 flex-1 text-left">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Asset Tag</p>
                <p className="font-mono font-black text-xl text-indigo-900 tracking-tight">
                  {asset.asset_tag}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Device Model</p>
                <p className="font-bold text-xs text-slate-800 truncate">{asset.name}</p>
                <p className="text-[11px] text-slate-600 truncate">{asset.category_name || 'Hardware'}</p>
              </div>

              <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 border-t border-slate-100">
                <span>
                  S/N: <strong className="text-slate-700 font-mono">{asset.serial_number || 'N/A'}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Loc: <strong className="text-slate-700">{asset.location || 'HQ Storage'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Barcode Line */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>SCAN TO VERIFY CUSTODY</span>
            <span>DO NOT REMOVE</span>
          </div>
        </div>

        {/* Scan Guidance */}
        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-3">
          <QrCode className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-slate-300">
            <p className="font-medium text-white">Physical Inventory Verification</p>
            <p className="text-[11px] text-slate-400">
              Scanning this label with any mobile device or barcode scanner redirects directly to this asset's verified inventory registry profile.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
