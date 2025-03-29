export class CustomInternalError extends Error {
  constructor(
    public readonly context: string,
    public readonly originalError: unknown,
  ) {
    const message =
      originalError instanceof Error
        ? originalError.message
        : 'Unknown internal error';

    super(`[${context}] ${message}`);
    this.name = 'CustomInternalError';
  }
}
