export default function LoreStats() {
  const stats = [
    { label: 'Universos', value: '3', icon: '🌌' },
    { label: 'Criaturas', value: '100+', icon: '🐙' },
    { label: 'Seguidores', value: '2M+', icon: '👥' },
    { label: 'Historias', value: '50+', icon: '📜' },
  ];

  return (
    <section className="py-12 bg-primary/5 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
