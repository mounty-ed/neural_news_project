import React, { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sources: string[];
};

function isUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SourcesModal({ isOpen, onClose, sources }): React.FC<Props> {
  // lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Article sources"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal panel */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900/95 text-slate-100 rounded-2xl shadow-lg ring-1 ring-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold">Sources ({sources.length})</h3>
          <button
            onClick={onClose}
            aria-label="Close sources"
            className="rounded-md px-2 py-1 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-auto">
          {sources.length === 0 ? (
            <p className="text-sm text-slate-400">No sources available.</p>
          ) : (
            <ul className="space-y-3">
              {sources.map((src, i) => (
                <li key={i} className="text-sm">
                  {isUrl(src) ? (
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:underline break-all"
                    >
                      {src}
                    </a>
                  ) : (
                    <span className="text-slate-300 break-words">{src}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              // copy all sources as newline-separated string
              const text = sources.join("\n");
              navigator.clipboard?.writeText(text);
            }}
            className="text-sm px-3 py-1 rounded-md bg-slate-800/60 hover:bg-slate-800/80"
          >
            Copy all
          </button>

          <button
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
