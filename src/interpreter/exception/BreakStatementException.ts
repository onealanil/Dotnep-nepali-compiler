export class BreakStatementException extends Error {
    constructor(message?: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); 
        this.name = BreakStatementException.name;
    }
}
