import React from 'react';
import MediaTile from './MediaTile';

export type GalleryItem = { src: string; caption?: string };

export type MediaGalleryProps = {
  items: GalleryItem[];
};

export default function MediaGallery({ items }: MediaGalleryProps) {
  if (!items?.length) return null;

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 justify-items-center">
      {items.map((item, i) => (
        <MediaTile key={i} src={item.src} caption={item.caption} />
      ))}
    </div>
  );
}
