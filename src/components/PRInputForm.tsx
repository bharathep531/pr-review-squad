interface Props {
  onSubmit: (title: string, branch: string, diff: string) => void;
  disabled: boolean;
}

export default function PRInputForm({ onSubmit, disabled }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const branch = (form.elements.namedItem('branch') as HTMLInputElement).value.trim();
    const diff = (form.elements.namedItem('diff') as HTMLTextAreaElement).value.trim();
    if (!title || !diff) return;
    onSubmit(title, branch, diff);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          PR Title
        </label>
        <input
          name="title"
          type="text"
          required
          disabled={disabled}
          placeholder="e.g. feat: add user authentication with JWT"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Branch Name
        </label>
        <input
          name="branch"
          type="text"
          disabled={disabled}
          placeholder="e.g. feature/jwt-auth"
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Git Diff / Description
        </label>
        <textarea
          name="diff"
          required
          disabled={disabled}
          rows={14}
          placeholder={`Paste your git diff or describe the PR changes here...

Example:
diff --git a/src/auth.py b/src/auth.py
+def login(username, password):
+    query = f"SELECT * FROM users WHERE username='{username}'"
+    user = db.execute(query)
+    if user and user.password == password:
+        return generate_token(user.id)`}
          className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 resize-none transition"
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900 disabled:text-violet-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all text-sm tracking-wide flex items-center justify-center gap-2"
      >
        {disabled ? (
          <>
            <span className="inline-flex gap-1">
              <span className="thinking-dot w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
              <span className="thinking-dot w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
              <span className="thinking-dot w-1.5 h-1.5 bg-violet-400 rounded-full inline-block" />
            </span>
            Squad Running...
          </>
        ) : (
          '▶ Run Squad'
        )}
      </button>
    </form>
  );
}
