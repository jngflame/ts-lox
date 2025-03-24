import type { Token } from "./token.ts";

export interface ExprVisitor<R> {
  visitUnaryExpr(expr: Unary): R;
  visitLiteralExpr(expr: Literal): R;
  visitGroupingExpr(expr: Grouping): R;
  visitBinaryExpr(expr: Binary): R;
}

export abstract class Expr {
  abstract accept<R>(v: ExprVisitor<R>): R;
}

export class Binary extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr,
  ) {
    super();
  }

  accept<R>(v: ExprVisitor<R>): R {
    return v.visitBinaryExpr(this);
  }
}

export class Grouping extends Expr {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(v: ExprVisitor<R>): R {
    return v.visitGroupingExpr(this);
  }
}

export class Literal extends Expr {
  constructor(public readonly value: unknown) {
    super();
  }

  accept<R>(v: ExprVisitor<R>): R {
    return v.visitLiteralExpr(this);
  }
}

export class Unary extends Expr {
  constructor(
    public readonly operator: Token,
    public readonly right: Expr,
  ) {
    super();
  }

  accept<R>(v: ExprVisitor<R>): R {
    return v.visitUnaryExpr(this);
  }
}
