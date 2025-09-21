import React from 'react';
import MediaTile from './MediaTile';

export type GalleryItem = { src: string; caption?: string };

export type MediaGalleryProps = {
  items: GalleryItem[];
};

export default function MediaGallery({ items }: MediaGalleryProps) {
  if (!items?.length) return null;

  // Use a flex container to center the tiles horizontally and wrap as needed
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      {items.map((item, i) => (
        <MediaTile key={i} src={item.src} caption={item.caption} />
      ))}
    </div>
  );
}
