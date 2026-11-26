"use client";

export default function SpotifyEmbed({ id, title, height = 152, className = "" }) {
  return (
    <iframe
      key={id}
      title={title ? `${title} on Spotify` : "Spotify player"}
      src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
      width="100%"
      height={height}
      className={className}
      style={{ border: 0, borderRadius: 12, display: "block" }}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}
