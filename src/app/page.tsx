import Image from "next/image";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero Section */}
      <section style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-primary)",
        backgroundImage: "linear-gradient(rgba(62, 39, 35, 0.7), rgba(62, 39, 35, 0.7)), url('/yellowstone-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        textAlign: "center",
        padding: "4rem 1.5rem"
      }}>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 768px) {
                .hero-title { font-size: 2.5rem !important; }
                .hero-subtitle { font-size: 1.1rem !important; }
                .feature-section { padding: 3rem 1rem !important; }
            }
        `}} />
        <div style={{ marginBottom: "2rem" }}>
          <Image
            src="/logo-la-milagrosa.jpg"
            alt="La Milagrosa Logo"
            width={160}
            height={160}
            style={{ borderRadius: "50%", border: "4px solid var(--color-accent)" }}
          />
        </div>
        <h1 className="hero-title" style={{ color: "white", fontSize: "4rem", marginBottom: "1rem" }}>Criadero La Milagrosa</h1>
        <p className="hero-subtitle" style={{ fontSize: "1.5rem", maxWidth: "800px", fontWeight: "300", fontStyle: "italic" }}>
          "Vida de campo, fe y respeto por todos los animales"
        </p>
        <div style={{ marginTop: "3rem" }}>
          <a href="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', padding: "1.2rem 2.5rem", fontSize: "1.1rem" }}>
            Acceder al Dashboard
          </a>
        </div>
      </section>

      {/* Feature Section */}
      <section className="feature-section" style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          <div className="premium-card">
            <h3>Gestión de Inventario</h3>
            <p className="text-muted">Control detallado de vacas, toros y caballos. Seguimiento de estados de gestación.</p>
          </div>
          <div className="premium-card">
            <h3>Finanzas en Tiempo Real</h3>
            <p className="text-muted">Monitoreo de gastos mensuales y producción de leche con gráficos interactivos.</p>
          </div>
          <div className="premium-card">
            <h3>Agente Inteligente</h3>
            <p className="text-muted">Consulta tu inventario y gastos mediante lenguaje natural desde cualquier lugar.</p>
          </div>
        </div>
      </section>

      <footer style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
        © 2026 Criadero La Milagrosa - Todos los derechos reservados.
      </footer>
    </main>
  );
}
