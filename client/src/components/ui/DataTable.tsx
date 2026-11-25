import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Spinner } from './Spinner';

interface Column<T> {
  key:      string;
  header:   string;
  render:   (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:   Column<T>[];
  data:      T[];
  keyField:  keyof T;
  loading?:  boolean;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
}

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0 },
};

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.04 } },
};

export function DataTable<T>({ columns, data, keyField, loading, emptyText = 'No records found', emptyIcon, onRowClick }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/40">
              {columns.map((col) => (
                <th key={col.key} className={clsx('px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex justify-center"><Spinner size="lg" /></div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    {emptyIcon && <div className="opacity-40">{emptyIcon}</div>}
                    <p>{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                {data.map((row, idx) => (
                  <motion.tr
                    key={String(row[keyField])}
                    variants={rowVariants}
                    custom={idx}
                    className={clsx(
                      'border-b border-slate-800/50 transition-colors duration-150',
                      'hover:bg-slate-800/30',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={clsx('px-4 py-3.5 text-slate-300', col.className)}>
                        {col.render(row)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </motion.tbody>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

