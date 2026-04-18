import FlipCard from './FlipCard';

const UNIVERSES = [
  {
    id: 'colosos',
    title: 'Colosos',
    image: '/assets/Universo Colosos/thebloop1resolucion.png',
    icon: '🦖',
    count: '42 Entidades',
    description: 'Bestias colosales que remecen el curso del ecosistema y la presencia humana.',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'capitan-de-galeon',
    title: 'Capitán de Galeón',
    image: '/assets/Universo Capitán de Galeón/Borisao 2 F (1).png',
    icon: '⚓',
    count: '15 Personajes',
    description: 'Batallas entre grandes navíos, capitanes excéntricos y piratas de otro mundo.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    id: 'ellos-llegaron',
    title: 'Ellos Llegaron',
    image: '/assets/Universo Ellos llegaron/ellosllegaron1.1.png',
    icon: '👽',
    count: '28 Eventos',
    description: 'La Tierra de los años 40 sacudida por un enemigo implacable venido de la nada.',
    color: 'bg-accent/10 text-accent',
  },
];

export default function Universes() {
  return (
    <section id="universos" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground">
            Explora los Universos
          </h2>
          <p className="text-lg text-muted-foreground">
            Cada universo contiene sus propias reglas, criaturas y misterios por descubrir. 
            Elige tu destino y sumérgete en la historia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {UNIVERSES.map((universe) => (
            <FlipCard key={universe.id} universe={universe} />
          ))}
        </div>
      </div>
    </section>
  );
}
