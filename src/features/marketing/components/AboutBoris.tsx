import Image from 'next/image';
import { Video, Camera, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutBoris() {
  return (
    <section id="sobre-boris" className="py-24 bg-card relative overflow-hidden">
      {/* Decorative Abyssal Rings */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 border border-primary/10 rounded-full" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] border border-primary/5 rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square relative rounded-[3rem] overflow-hidden border-8 border-background shadow-2xl">
              <Image 
                src="/assets/logo.png" 
                alt="BorisaoBlois Creator" 
                fill 
                className="object-cover"
              />
            </div>
            {/* Experience Tag */}
            <div className="absolute -top-6 -right-6 bg-primary text-primary-foreground p-8 rounded-3xl shadow-xl rotate-12">
              <p className="text-4xl font-black">2M+</p>
              <p className="text-sm font-bold uppercase">Seguidores</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-sm">El Creador</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold text-foreground">
                Detrás de los <br /> Universos: BorisaoBlois
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                BorisaoBlois es un narrador visual y arquitecto de mundos que ha cautivado a millones con sus historias sobre colosos marinos, invasiones alienígenas y misterios navales. Su pasión por lo abisal y lo desconocido se refleja en cada detalle de sus creaciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Canal Principal</p>
                  <p className="text-sm text-muted-foreground">@BorisaoBlois</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Comunidad</p>
                  <p className="text-sm text-muted-foreground">Historias Diarias</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button size="lg" className="rounded-full px-8">Saber más</Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                  <Camera className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
