export function WikiArticleFooter() {
  return (
    <footer className="px-4 md:px-12 py-8 border-t border-white/10 mt-12 mb-12 mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            Archivo desclasificado // Iniciativa Abisal
          </div>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary italic drop-shadow-[0_0_10px_rgba(255,115,0,0.3)]">
          Borisao Archives
        </div>
      </div>
    </footer>
  );
}

