/* eslint-disable @next/next/no-img-element */
"use client";
import { Skeleton } from "./ui/skeleton";

export const ImageSectionSkeleton = () => {
  return (
    <>
      <div className="my-4 grid grid-cols-1 gap-2 lg:grid-cols-2 w-full">
        {[...Array(4)].map((_, index) => (
          <div className="w-full h-full" key={`image-skeleton-${index}`}>
            <Skeleton className="rounded-md object-cover shadow-none border-none w-full bg-card h-[160px] " />
          </div>
        ))}
      </div>
    </>
  );
};

export function ImageSection({ images }: { images: string[] }) {
  if (images && images.length > 0) {
    return (
      <div className="my-4 grid grid-cols-1 gap-2 lg:grid-cols-2">
        {images.map((image) => (
          <a
            key={image}
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="aspect-video w-full h-full overflow-hidden hover:scale-[1.03] duration-150 rounded-lg transition-all shadow-md"
          >
            <img
              src={image}
              className="w-full object-cover object-top h-full max-h-[80vh]"
            />
          </a>
        ))}
      </div>
    );
  }
  return null;
}
