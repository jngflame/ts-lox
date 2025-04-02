import {
  Assign,
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  Variable,
} from "./expr.ts";
import Lox from "./main.ts";
import Stmt, { Block, Expression, Print, Var } from "./stmt.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

export class Parser {
  private current: number = 0;
  constructor(private readonly tokens: Token[]) {}

  private expression(): Expr {
    return this.assignment();
  }
  assignment(): Expr {
    const expr: Expr = this.equality();
    if (this.match(TokenType.EQUAL)) {
      const equals: Token = this.previous();
      const value: Expr = this.assignment();
      if (expr instanceof Variable) {
        const name: Token = expr.name;
        return new Assign(name, value);
      }
      this.error(equals, "Invalid assignment target.");
    }
    return expr;
  }

  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  private comparison(): Expr {
    let term = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator: Token = this.previous();
      const right: Expr = this.term();
      term = new Binary(term, operator, right);
    }
    return term;
  }

  private term(): Expr {
    let expr: Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.factor();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  private factor(): Expr {
    let expr: Expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }
    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr: Expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    throw this.error(this.peek(), "Expected expression.");
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.error(token, message);
    return new ParseError(token, message);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type; // Changed == to === for strict equality
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF; // Changed == to === for strict equality
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }
      this.advance();
    }
  }

  private statement(): Stmt {
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.LEFT_BRACE)) {
      return new Block(this.block());
    }
    return this.expressionStatement();
  }
  block(): Stmt[] {
    const statements: Stmt[] = [];
    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      const dec = this.declaration();
      if (dec !== null) statements.push(dec);
    }
    this.consume(TokenType.RIGHT_BRACE, "Expected '}' after block.");
    return statements;
  }
  private expressionStatement(): Stmt {
    const expr: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after expression.");
    return new Expression(expr);
  }
  private printStatement(): Stmt {
    const value: Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expected ';' after value.");
    return new Print(value);
  }

  public parse(): Stmt[] {
    const statements: Stmt[] = [];

    while (!this.isAtEnd()) {
      const dec = this.declaration();
      if (dec !== null) statements.push(dec);
    }

    return statements;
  }
  private declaration(): Stmt | null {
    try {
      if (this.match(TokenType.VAR)) {
        return this.varDeclaration();
      }
      return this.statement();
    } catch (error) {
      if (error instanceof ParseError) {
        this.synchronize();
      }
    }
    return null;
  }
  private varDeclaration(): Stmt | null {
    const name: Token = this.consume(
      TokenType.IDENTIFIER,
      "Expect variable name.",
    );
    let initializer: Expr | null = null;

    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(
      TokenType.SEMICOLON,
      "Expected ';' after variable declaration.",
    );
    return new Var(name, initializer);
  }
}

class ParseError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
  }
}
