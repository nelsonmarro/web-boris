'use client'

import { Card, CardContent } from "@/components/ui/card"
import { YouTubeEmbed } from '@next/third-parties/google'

interface VideoProps {
  id: string
  title: string
  priority?: boolean
}

const VideoEmbed = ({ id, title, priority = false }: VideoProps) => (
  <Card className={`overflow-hidden border-border bg-card/40 backdrop-blur-sm transition-all hover:border-primary/50 group ${priority ? 'lg:col-span-2' : ''}`}>
    <CardContent className="p-0">
      <div className={`relative w-full overflow-hidden ${priority ? 'aspect-video' : 'aspect-video md:aspect-[16/9]'}`}>
        <YouTubeEmbed 
          videoid={id} 
          params="controls=1&rel=0"
          style="max-width: 100%;"
        />
      </div>
      <div className="p-4 border-t border-border group-hover:bg-primary/5 transition-colors">
        <h4 className={`font-bold text-foreground ${priority ? 'text-xl' : 'text-lg line-clamp-1'}`}>
          {title}
        </h4>
      </div>
    </CardContent>
  </Card>
)

export default function FeaturedVideos() {
  const videos = [
    {
      id: "hedUAqopPBg",
      title: "El Gran Majá vs The Bloop",
      priority: true
    },
    {
      id: "VQRNN3YNRWk",
      title: "El Misterio de los Colosos",
      priority: false
    },
    {
      id: "IFpO2DqWDXQ",
      title: "Ellos Llegaron: El Inicio",
      priority: false
    }
  ]

  return (
    <section id="videos" className="py-24 bg-background relative overflow-hidden">
      {/* Background glow for ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">
            Videos Destacados
          </h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Vive las batallas y descubre el misterio de los seres más poderosos de los océanos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {videos.map((v) => (
            <VideoEmbed key={v.id} {...v} />
          ))}
        </div>
      </div>
    </section>
  )
}
