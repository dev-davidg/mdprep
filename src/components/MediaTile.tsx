import React from "react";
type MediaTileProps = { src: string; alt?: string; caption?: string };
export default function MediaTile({ src, alt = "", caption }: MediaTileProps) {
  return (
    <figure className="rounded-2xl border border-border bg-muted/30 p-2">
      <div className="w-full min-h-[14rem] sm:min-h-[16rem] md:min-h-[18rem] grid place-items-center overflow-hidden rounded-xl bg-background">
        <img src={src} alt={alt} className="block mx-auto max-h-full max-w-full h-auto w-auto object-contain" draggable={false} loading="lazy" />
      </div>
      {caption ? <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}
