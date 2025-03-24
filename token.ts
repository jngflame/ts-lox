import type { TokenType } from "./token_type.ts";

export class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public liternal: unknown,
    public line: number,
  ) {}

  toString() {
    return this.type + " " + this.lexeme + " " + this.liternal;
  }
}
