import { Scanner } from "./scanner.ts";

export default class Lox {
  static hadError: boolean = false;

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

    for (const token of tokens) {
      console.log(token);
    }
  }

  static error(line: number, message: string) {
    Lox.report(line, "", message);
  }

  static report(line: number, where: string, message: string) {
    console.log("[line " + line + "] Error" + where + ": " + message);
    Lox.hadError = true;
  }
}

Lox.main()
