import { AstPrinter } from "./ast_printer.ts";
import { Expr } from "./expr.ts";
import Interpreter from "./interpreter.ts";
import { Parser } from "./parser.ts";
import type RuntimeError from "./runtime_error.ts";
import { Scanner } from "./scanner.ts";
import type Stmt from "./stmt.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

export default class Lox {
  static runtimeError(error: RuntimeError) {
    console.log(
      `${error.message}\n[line ${error.token.line}]`,
    );
    Lox.hadRuntimeError = true;
  }
  static hadError: boolean = false;
  static hadRuntimeError: boolean = false;
  private static readonly interpreter: Interpreter = new Interpreter();

  static main() {
    if (Deno.args.length > 1) {
      console.log("Usage: ts-lox [script]");
      Deno.exit(64);
    } else if (Deno.args.length == 1) {
      Lox.runFile(Deno.args[0]);
    } else {
      Lox.runPrompt();
    }
  }

  static async runFile(path: string) {
    const code = await Deno.readTextFile(path);
    Lox.run(code);
    if (Lox.hadError) Deno.exit(65);
  }

  static runPrompt() {
    while (true) {
      const line = prompt("> ");
      if (line == null) break;
      Lox.run(line);
      Lox.hadError = false;
    }
  }

  static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser: Parser = new Parser(tokens);
    const statements: Stmt[] = parser.parse();

    // Stop if there was a syntax error.
    if (this.hadError) return;

    // console.log(new AstPrinter().print(expression));
    this.interpreter.interpret(statements);
  }

  static error(lineOrToken: number | Token, message: string) {
    if (typeof lineOrToken === "number") {
      Lox.report(lineOrToken, "", message);
    } else {
      if (lineOrToken.type === TokenType.EOF) {
        this.report(lineOrToken.line, " at end", message);
      } else {
        this.report(
          lineOrToken.line,
          " at '" + lineOrToken.lexeme + "'",
          message,
        );
      }
    }
  }

  static report(line: number, where: string, message: string) {
    console.log("[line " + line + "] Error" + where + ": " + message);
    Lox.hadError = true;
  }
}

Lox.main();
