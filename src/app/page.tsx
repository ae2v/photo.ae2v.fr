import Image from "next/image";
import { connection } from "next/server";
import { AlbumBrowser } from "@/components/album-browser";
import { getEventsState } from "@/lib/events";

export default async function Home() {
  await connection();
  const state = await getEventsState();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://photo.ae2v.fr").replace(/\/$/, "");

  return (
    <main>
      <section className="hero">
        <div className="hero-mark" aria-hidden="true">ALBUMS</div>
        <div className="hero-content">
          <p className="hero-kicker">Les souvenirs du campus</p>
          <h1 aria-label="Photos AE2V">
            <span>Photos</span>
            <span className="title-second">AE2V<i aria-hidden="true" /></span>
          </h1>
          <p className="hero-intro">Tous les événements. Tous les souvenirs. Un lien.</p>
        </div>
      </section>

      <section className="events-section" aria-labelledby="events-title">
        <div className="section-heading">
          <h2 id="events-title">Les albums</h2>
          {state.status === "ready" && (
            <p>{state.events.length} album{state.events.length === 1 ? "" : "s"} disponible{state.events.length === 1 ? "" : "s"}</p>
          )}
        </div>

        {state.status === "ready" && state.events.length > 0 && (
          <AlbumBrowser albums={state.events} siteUrl={siteUrl} />
        )}

        {state.status === "ready" && state.events.length === 0 && (
          <StatusPanel title="Aucun album publié">Partage un sous-dossier Drive avec « Tous les utilisateurs disposant du lien » pour le faire apparaître ici.</StatusPanel>
        )}
        {state.status === "unconfigured" && (
          <StatusPanel title="Configuration en cours">Le site est bien installé. Les accès Google Drive et la base de données doivent maintenant être ajoutés dans Vercel.</StatusPanel>
        )}
        {state.status === "error" && (
          <StatusPanel title="Albums momentanément indisponibles">La connexion à Google Drive n’a pas abouti. Réessaie dans quelques instants.</StatusPanel>
        )}
      </section>

      <footer>
        <a href="https://ae2v.fr" aria-label="Accéder au site officiel de l’AE2V">
          <Image src="/logo-ae2v.svg" alt="AE2V — Always further, together" width={154} height={46} />
        </a>
        <a className="official-site-link" href="https://ae2v.fr">
          Site officiel AE2V <ArrowIcon />
        </a>
      </footer>
    </main>
  );
}

function StatusPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="status-panel">
      <span aria-hidden="true">!</span>
      <div><h3>{title}</h3><p>{children}</p></div>
    </div>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
