"use client";

import { useMemo, useState } from "react";
import { CopyLinkButton } from "@/components/copy-link-button";

type Album = {
  driveFolderId: string;
  name: string;
  shortCode: string;
  driveUrl: string;
  createdTime?: string;
  modifiedTime?: string;
};

type SortField = "createdTime" | "modifiedTime";
type SortDirection = "asc" | "desc";
type ViewMode = "list" | "grid";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function dateValue(value?: string): number {
  return value ? new Date(value).getTime() : 0;
}

function formatDate(value?: string): string {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

function AlbumBrowser({ albums, siteUrl }: { albums: Album[]; siteUrl: string }) {
  const [sortField, setSortField] = useState<SortField>("createdTime");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const sortedAlbums = useMemo(() => [...albums].sort((a, b) => {
    const difference = dateValue(a[sortField]) - dateValue(b[sortField]);
    if (difference !== 0) return sortDirection === "asc" ? difference : -difference;
    return a.name.localeCompare(b.name, "fr");
  }), [albums, sortDirection, sortField]);

  function changeSort(nextField: SortField) {
    if (nextField === sortField) {
      setSortDirection((current) => current === "desc" ? "asc" : "desc");
      return;
    }
    setSortField(nextField);
    setSortDirection("desc");
  }

  return (
    <>
      <div className="album-toolbar">
        <div className="control-group" role="group" aria-label="Trier les albums">
          <span className="control-label">Trier par</span>
          <SortButton
            active={sortField === "createdTime"}
            direction={sortDirection}
            onClick={() => changeSort("createdTime")}
          >
            Création
          </SortButton>
          <SortButton
            active={sortField === "modifiedTime"}
            direction={sortDirection}
            onClick={() => changeSort("modifiedTime")}
          >
            Modification
          </SortButton>
        </div>

        <div className="view-controls" role="group" aria-label="Mode d’affichage">
          <button
            type="button"
            aria-label="Vue liste"
            aria-pressed={viewMode === "list"}
            data-active={viewMode === "list" || undefined}
            onClick={() => setViewMode("list")}
          >
            <ListIcon />
          </button>
          <button
            type="button"
            aria-label="Vue grille"
            aria-pressed={viewMode === "grid"}
            data-active={viewMode === "grid" || undefined}
            onClick={() => setViewMode("grid")}
          >
            <GridIcon />
          </button>
        </div>
      </div>

      <div className={`event-list view-${viewMode}`}>
        {sortedAlbums.map((album, index) => (
          <AlbumCard
            key={album.driveFolderId}
            album={album}
            index={index + 1}
            siteUrl={siteUrl}
          />
        ))}
      </div>
    </>
  );
}

function SortButton({
  active,
  direction,
  onClick,
  children,
}: {
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="sort-button"
      aria-pressed={active}
      data-active={active || undefined}
      onClick={onClick}
    >
      {children}
      <span aria-hidden="true">{active ? (direction === "desc" ? "↓" : "↑") : "↕"}</span>
    </button>
  );
}

function AlbumCard({ album, index, siteUrl }: { album: Album; index: number; siteUrl: string }) {
  const shortUrl = `${siteUrl}/${album.shortCode}`;
  return (
    <article className="event-row">
      <span className="event-index" aria-hidden="true">{String(index).padStart(2, "0")}</span>
      <div className="event-main">
        <div className="event-copy">
          <p className="public-label"><span /> Album public</p>
          <h3>{album.name}</h3>
          <a className="short-link" href={`/${album.shortCode}`}>{shortUrl.replace(/^https?:\/\//, "")}</a>
        </div>

        <dl className="event-dates">
          <div>
            <dt>Créé le</dt>
            <dd><time dateTime={album.createdTime}>{formatDate(album.createdTime)}</time></dd>
          </div>
          <div>
            <dt>Modifié le</dt>
            <dd><time dateTime={album.modifiedTime}>{formatDate(album.modifiedTime)}</time></dd>
          </div>
        </dl>

        <div className="event-actions">
          <a className="button button-primary" href={`/${album.shortCode}`} target="_blank" rel="noreferrer">
            Voir <ArrowIcon />
          </a>
          <CopyLinkButton url={shortUrl} />
        </div>
      </div>
    </article>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function ListIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" /></svg>;
}

function GridIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z" /></svg>;
}

export { AlbumBrowser };
