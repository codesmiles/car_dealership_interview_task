

abstract class ResponseBuilderAbstract<T> {
  constructor(
    protected message: string,
    protected status: number,
    protected data: T | null = null
  ) {}

  abstract toJson(): object;
}

class ResponseBuilder<T> extends ResponseBuilderAbstract<T> {
  public static readonly SUCCESS_MESSAGE = "Operation succeeded";
  public static readonly ERROR_MESSAGE = "Operation failed";

  toJson() {
    return {
      message: this.message,
      status: this.status,
      data: this.data,
    };
  }
}

export { ResponseBuilder };
