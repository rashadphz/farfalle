/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinalResponseStream } from "./FinalResponseStream";
import type { RelatedQueriesStream } from "./RelatedQueriesStream";
import type { SearchQueryStream } from "./SearchQueryStream";
import type { SearchResultStream } from "./SearchResultStream";
import type { StreamEndStream } from "./StreamEndStream";
import type { StreamEvent } from "./StreamEvent";
import type { TextChunkStream } from "./TextChunkStream";
export type ChatResponseEvent = {
  event: StreamEvent;
  data:
    | SearchQueryStream
    | SearchResultStream
    | TextChunkStream
    | RelatedQueriesStream
    | StreamEndStream
    | FinalResponseStream;
};
