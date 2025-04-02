import type { Token } from "./token.ts";

export default class RuntimeError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
  }
}
