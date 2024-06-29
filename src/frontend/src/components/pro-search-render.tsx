import { AssistantMessageContent } from "./assistant-message";
import { Separator } from "./ui/separator";
import { UserMessageContent } from "./user-message";
import { memo, useEffect, useState } from "react";
import {
  AgentSearchFullResponse,
  AgentSearchStepStatus,
  ChatMessage,
  MessageRole,
  SearchResult,
} from "../../generated";
import _ from "lodash";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { SearchIcon, WandSparklesIcon } from "lucide-react";
import { Logo } from "./search-results";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "./ui/timeline";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

const StepSection = ({
  step,
  queries,
  results,
}: {
  step: string;
  queries: string[];
  results: SearchResult[];
}) => {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex flex-col gap-1 text-xs transition-all duration-300 ease-in-out",
          queries.length > 0
            ? "opacity-100 max-h-[500px]"
            : "opacity-0 max-h-0 overflow-hidden",
        )}
      >
        <div className="text-muted-foreground font-medium">Searching</div>
        <div className="flex flex-wrap gap-1">
          {queries.map((query, index) => (
            <div
              key={`query-${index}`}
              className="bg-card rounded-full text-muted-foreground px-2 py-1 mr-2 mb-2 font-medium flex items-center"
            >
              <SearchIcon className="h-3 w-3 mr-1" />
              {query}
            </div>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-1 text-xs transition-all duration-300 ease-in-out",
          results.length > 0
            ? "opacity-100 max-h-[500px]"
            : "opacity-0 max-h-0 overflow-hidden",
        )}
      >
        <div className="text-muted-foreground font-medium">Results</div>
        <div className="flex flex-wrap gap-1">
          {results.map((result, index) => {
            const formattedUrl = new URL(result.url).hostname
              .split(".")
              .slice(-2, -1)[0];
            return (
              <a
                className="bg-card rounded-full text-muted-foreground pl-2 pr-2 py-1 mr-2 mb-2 font-medium flex items-center space-x-1 hover:bg-card/80"
                href={result.url}
                target="_blank"
                key={`result-${index}`}
              >
                <Logo url={result.url} />
                <div className="">{formattedUrl}</div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProSearchSkeleton = () => {
  return (
    <div className="w-full border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <WandSparklesIcon className="h-5 w-5 mr-2" />
        <h1 className="text-lg font-medium ">Expert Search</h1>
      </div>
      <Separator />
      <Skeleton className="w-full h-[30px] bg-card" />
    </div>
  );
};

export const ProSearchRender = ({
  streamingProResponse,
  isStreamingProSearch = false,
}: {
  streamingProResponse: AgentSearchFullResponse | null;
  isStreamingProSearch?: boolean;
}) => {
  const [accordionValues, setAccordionValues] = useState<string[]>([]);

  useEffect(() => {
    if (!streamingProResponse?.steps_details) {
      return;
    }
    const stepDetails = streamingProResponse.steps_details;
    if (!stepDetails) {
      return;
    }
    const currentSteps = stepDetails
      .map((step, index) => ({ index, status: step.status }))
      .filter((step) => step.status === AgentSearchStepStatus.CURRENT)
      .map((step) => step.index.toString());

    setAccordionValues(currentSteps);
  }, [streamingProResponse]);

  if (!streamingProResponse?.steps_details) {
    return isStreamingProSearch ? <ProSearchSkeleton /> : null;
  }
  const { steps_details: stepDetails } = streamingProResponse;

  return (
    <div className="w-full border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <WandSparklesIcon className="h-5 w-5 mr-2" />
        <h1 className="text-lg font-medium ">Expert Search</h1>
      </div>
      <Separator />
      <Timeline className="w-full">
        {stepDetails.map(({ step, queries, results, status }, index) => {
          const isLast = index === stepDetails.length - 1;
          return (
            <TimelineItem key={index} status="default">
              <TimelineDot status={status} />
              {!isLast && <TimelineLine done />}
              <TimelineContent className="w-full">
                <Accordion
                  type="multiple"
                  className="w-full"
                  value={accordionValues}
                  onValueChange={setAccordionValues}
                >
                  <AccordionItem
                    value={index.toString()}
                    className={cn(isLast ? "border-b-0" : "")}
                    disabled={status !== AgentSearchStepStatus.DONE || isLast}
                  >
                    <AccordionTrigger className="w-full text-left hover:no-underline hover:bg-card/80 rounded-md px-2 py-2 my-1 text-primary">
                      {step}
                    </AccordionTrigger>
                    <AccordionContent className="w-full px-3 py-1">
                      <StepSection
                        step={step}
                        queries={queries || []}
                        results={results || []}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </div>
  );
};
