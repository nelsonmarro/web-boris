export function WikiArticleFooter() {
  return (
    <footer className="px-8 md:px-16 py-10 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-white/20">
          Archivo desclasificado // Iniciativa Abisal
        </div>
      </div>
      <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary italic drop-shadow-[0_0_10px_rgba(255,115,0,0.3)]">
        Borisao Archives
      </div>
    </footer>
  );
}