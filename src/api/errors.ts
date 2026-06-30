export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: unknown;
  };
  request_id: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly requestId: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
    this.requestId = body.request_id;
  }

  static isApiError(err: unknown): err is ApiError {
    return err instanceof ApiError;
  }

  /** True when the server returned a conflict we can retry with the same key. */
  isInProgress(): boolean {
    return this.code === "IDEMPOTENCY_REQUEST_IN_PROGRESS";
  }
}
