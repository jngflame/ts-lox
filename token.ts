import type { TokenType } from "./token_type.ts";

export class Token{
	type: TokenType;
	lexeme: string;
	liternal: unknown;
	line: number;

	constructor(type: TokenType, lexeme: string, liternal: unknown, line: number){
		this.type = type;
		this.lexeme = lexeme;
		this.liternal = liternal;
		this.line = line;
	}

	toString(){
		return this.type + " " + this.lexeme + " " + this.liternal;
	}
}
