/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatRequest } from "../models/ChatRequest";
import type { ChatResponseEvent } from "../models/ChatResponseEvent";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class DefaultService {
  /**
   * Root
   * @returns any Successful Response
   * @throws ApiError
   */
  public static rootGet(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/",
    });
  }
  /**
   * Chat
   * @param requestBody
   * @returns ChatResponseEvent Successful Response
   * @throws ApiError
   */
  public static chatChatPost(
    requestBody: ChatRequest,
  ): CancelablePromise<Array<ChatResponseEvent>> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/chat",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
