import { Context } from "fdc3_2_0";

export interface ContextWithError extends Context {
    errorMessage?: string;
  }
