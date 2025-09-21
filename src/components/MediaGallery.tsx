import React from "react";
import MediaTile from "./MediaTile";

export type GalleryItem = { src: string; caption?: string };

type MediaGalleryProps = {
  items: GalleryItem[];
};

export default function MediaGallery({ items }: MediaGalleryProps) {
  if (!items?.length) return null;
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 auto-rows-fr">
      {items.map((it, i) => (
        <MediaTile key={i} src={it.src} caption={it.caption} />
      ))}
    </div>
  );
}
