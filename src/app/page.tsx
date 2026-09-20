import Image from "next/image";
import { connection } from "next/server";
import { CopyLinkButton } from "@/components/copy-link-button";
import { getEventsState, type PublicEvent } from "@/lib/events";

export default async function Home() {
  await connection();
  const state = await getEventsState();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://photo.ae2v.fr").replace(/\/$/, "");

  return (
    <main>
      <header className="site-header">
        <a href="https://ae2v.fr" aria-label="Retour au site AE2V">
          <Image src="/emblem-ae2v-white.svg" alt="" width={48} height={48} priority />
        </a>
        <span>Photothèque</span>
      </header>

      <section className="hero">
        <div className="hero-mark" aria-hidden="true">PHOTOS</div>
        <div className="hero-content">
          <p className="hero-kicker">Les souvenirs du campus</p>
          <h1>Photos<br />AE2V</h1>
          <p className="hero-intro">Retrouve les albums des événements de l’association et partage-les en un lien.</p>
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
          <div className="event-list">
            {state.events.map((event, index) => (
              <EventRow key={event.driveFolderId} event={event} index={index + 1} siteUrl={siteUrl} />
            ))}
          </div>
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
        <Image src="/logo-ae2v.svg" alt="AE2V — Always further, together" width={154} height={46} />
        <p>Albums hébergés sur Google Drive · Mise à jour toutes les 10 minutes</p>
      </footer>
    </main>
  );
}

function EventRow({ event, index, siteUrl }: { event: PublicEvent; index: number; siteUrl: string }) {
  const shortUrl = `${siteUrl}/${event.shortCode}`;
  return (
    <article className="event-row">
      <span className="event-index" aria-hidden="true">{String(index).padStart(2, "0")}</span>
      <div className="event-main">
        <div className="event-copy">
          <p className="public-label"><span /> Album public</p>
          <h3>{event.name}</h3>
          <a className="short-link" href={`/${event.shortCode}`}>{shortUrl.replace(/^https?:\/\//, "")}</a>
        </div>
        <div className="event-actions">
          <a className="button button-primary" href={`/${event.shortCode}`} target="_blank" rel="noreferrer">Voir l’album <ArrowIcon /></a>
          <CopyLinkButton url={shortUrl} />
        </div>
      </div>
    </article>
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
