/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchResult } from "@/types";
import { Skeleton } from "./ui/skeleton";

export const SearchResultsSkeleton = () => {
  return (
    <>
      <div className="flex flex-wrap w-full">
        {[...Array(4)].map((_, index) => (
          <div className="w-1/2 md:w-1/4 p-1" key={`skeleton-${index}`}>
            <Skeleton className="rounded-md shadow-none border-none h-[70px] bg-card " />
          </div>
        ))}
      </div>
    </>
  );
};

export function SearchResults({ results }: { results: SearchResult[] }) {
  const [showAll, setShowAll] = useState(false);

  const displayedResults = showAll ? results : results.slice(0, 3);
  const additionalCount = results.length > 3 ? results.length - 3 : 0;
  return (
    <div className="flex flex-wrap w-full ">
      {displayedResults.map(({ title, url }, index) => {
        const formattedUrl = new URL(url).hostname.split(".").slice(-2, -1)[0];

        return (
          <div key={`source-${index}`} className="w-1/2 md:w-1/4 p-1">
            <Card className="flex-1 rounded-md flex-col shadow-none border-none h-[70px]">
              <CardContent className="p-2 flex flex-col justify-between h-full">
                <p className="text-xs line-clamp-2 font-medium text-foreground/80">
                  {title}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="rounded-full overflow-hidden relative">
                    <img
                      className="block relative"
                      src={`https://www.google.com/s2/favicons?sz=128&domain=${url}`}
                      alt="favicon"
                      width={16}
                      height={16}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground truncate font-medium">
                    {formattedUrl}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
      {!showAll && additionalCount > 0 && (
        <div className="w-1/2 md:w-1/4  p-1">
          <Card className="flex-1 rounded-md flex h-full items-center justify-center shadow-none border-none">
            <CardContent className="p-2">
              <Button
                variant="link"
                className="text-muted-foreground"
                onClick={() => setShowAll(true)}
              >
                View {additionalCount} more
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
