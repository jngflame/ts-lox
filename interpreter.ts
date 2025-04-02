import { Environment } from "./environment.ts";
import type {
  Assign,
  Binary,
  Expr,
  ExprVisitor,
  Grouping,
  Literal,
  Unary,
  Variable,
} from "./expr.ts";
import Lox from "./main.ts";
import RuntimeError from "./runtime_error.ts";
import type Stmt from "./stmt.ts";
import type { Block, Expression, Print, StmtVisitor, Var } from "./stmt.ts";
import { Token } from "./token.ts";
import { TokenType } from "./token_type.ts";

export default class Interpreter
  implements ExprVisitor<unknown>, StmtVisitor<void> {
  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }
  executeBlock(statements: Stmt[], env: Environment) {
    this.environment = env;

    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = env.enclosing!;
    }
  }
  visitAssignExpr(expr: Assign): unknown {
    const value: unknown = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }
  private environment: Environment = new Environment();
  visitVarStmt(stmt: Var): void {
    let value: unknown = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }
    this.environment.define(stmt.name.lexeme, value);
  }
  visitVariableExpr(expr: Variable): unknown {
    return this.environment.get(expr.name);
  }
  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }
  visitPrintStmt(stmt: Print): void {
    const value: unknown = this.evaluate(stmt.expression);
    console.log(this.stringfy(value));
  }
  visitUnaryExpr(expr: Unary): unknown {
    const right: unknown = this.evaluate(expr.right);

    if (expr.operator.type === TokenType.MINUS) {
      this.checkNumberOperand(expr.operator, right);
      return -(right as number);
    }

    return null;
  }
  visitLiteralExpr(expr: Literal): unknown {
    return expr.value;
  }
  visitGroupingExpr(expr: Grouping): unknown {
    return this.evaluate(expr.expression);
  }
  visitBinaryExpr(expr: Binary): unknown {
    const left: unknown = this.evaluate(expr.left);
    const right: unknown = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) - (right as number);

      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) / (right as number);

      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) * (right as number);

      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return (left as number) + (right as number);
        }
        if (typeof left === "string" && typeof right === "string") {
          return (left as string) + (right as string);
        }
        break;
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) > (right as number);

      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) >= (right as number);

      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) < (right as number);

      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return (left as number) <= (right as number);

      case TokenType.BANG_EQUAL:
        return left !== right;
      case TokenType.EQUAL_EQUAL:
        return left === right;
    }
    return null;
  }

  private checkNumberOperand(operator: Token, operand: unknown): void {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: unknown,
    right: unknown,
  ): void {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private evaluate(expr: Expr): unknown {
    return expr.accept(this);
  }

  public interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      }
    }
  }
  private execute(statement: Stmt) {
    statement.accept(this);
  }

  private stringfy(value: unknown): string {
    if (value === null || value === undefined) return "nil";
    return value.toString();
  }
}
