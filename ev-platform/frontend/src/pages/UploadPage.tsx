import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileCheck2, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "../components/Card";
import { api } from "../services/api";
import type { UploadResult } from "../types";

export function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.uploadCSV(file);
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl2 border-2 border-dashed bg-card p-6 text-center shadow-soft transition-colors dark:bg-card-dark ${dragging ? "border-primary bg-primary/5" : "border-border dark:border-border-dark"}`}
      >
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {uploading ? <Loader2 size={26} className="animate-spin" /> : <UploadCloud size={26} />}
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-ink-dark">
              {uploading ? "Processing your dataset…" : "Drag and drop your CSV here"}
            </p>
            <p className="mt-1 text-sm text-muted dark:text-muted-dark">or click below to browse files</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Choose CSV File
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>

      {result && (
        <Card className="animate-slide-up border border-success/20 bg-success/5">
          <div className="flex items-start gap-3">
            <FileCheck2 className="mt-0.5 shrink-0 text-success" size={20} />
            <div>
              <p className="font-semibold text-ink dark:text-ink-dark">{result.message}</p>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted dark:text-muted-dark">Rows received</p>
                  <p className="font-semibold text-ink dark:text-ink-dark">{result.rows_received.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted dark:text-muted-dark">Rows stored</p>
                  <p className="font-semibold text-ink dark:text-ink-dark">{result.rows_stored.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted dark:text-muted-dark">Removed (duplicates/invalid)</p>
                  <p className="font-semibold text-ink dark:text-ink-dark">{result.rows_removed.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="animate-slide-up border border-danger/20 bg-danger/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-danger" size={20} />
            <div>
              <p className="font-semibold text-ink dark:text-ink-dark">Upload failed</p>
              <p className="mt-1 text-sm text-muted dark:text-muted-dark">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-sm font-semibold text-ink dark:text-ink-dark">Expected CSV format</h3>
        <p className="mt-1 mb-3 text-sm text-muted dark:text-muted-dark">
          Your file should include the following columns. Missing values are handled automatically and duplicate sessions are removed.
        </p>
        <div className="overflow-x-auto rounded-lg bg-bg dark:bg-white/5">
          <code className="block whitespace-nowrap px-4 py-3 text-xs text-muted dark:text-muted-dark">
            session_id, station_id, station_name, latitude, longitude, total_chargers, start_time, duration_minutes, energy_kwh, charger_type, vehicle_model, cost_inr
          </code>
        </div>
      </Card>
    </div>
  );
}
