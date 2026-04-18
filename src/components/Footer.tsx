export default function Footer() {
  return (
    <footer className="bg-muted py-8 border-t border-border mt-auto">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>Explora la inmensidad de mis universos y sus historias.</p>
        <p className="mt-2 text-sm">© {new Date().getFullYear()} BorisaoBlois. Todos los derechos reservados.</p>
        <div className="mt-4">
          <a href="mailto:borisaoblois343@gmail.com" className="text-primary hover:underline">borisaoblois343@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}
