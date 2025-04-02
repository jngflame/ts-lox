import type { Expr } from "./expr.ts";
import type { Token } from "./token.ts";

export default abstract class Stmt {
  abstract accept<R>(v: StmtVisitor<R>): R;
}

export interface StmtVisitor<R> {
  visitBlockStmt(stmt: Block): R;
  // visitClassStmt(stmt: Class): R;
  visitExpressionStmt(stmt: Expression): R;
  // visitFunctionStmt(stmt: Function): R;
  // visitIfStmt(stmt: If): R;
  visitPrintStmt(stmt: Print): R;
  // visitReturnStmt(stmt: Return): R;
  visitVarStmt(stmt: Var): R;
  // visitWhileStmt(stmt: While): R;
}

export class Print extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }
  accept<R>(v: StmtVisitor<R>): R {
    return v.visitPrintStmt(this);
  }
}

export class Expression extends Stmt {
  constructor(public readonly expression: Expr) {
    super();
  }
  accept<R>(v: StmtVisitor<R>): R {
    return v.visitExpressionStmt(this);
  }
}

export class Var extends Stmt {
  constructor(
    public readonly name: Token,
    public readonly initializer: Expr | null,
  ) {
    super();
  }

  accept<R>(v: StmtVisitor<R>): R {
    return v.visitVarStmt(this);
  }
}

export class Block extends Stmt {
  constructor(public readonly statements: Stmt[]) {
    super();
  }

  accept<R>(v: StmtVisitor<R>): R {
    return v.visitBlockStmt(this);
  }
}
