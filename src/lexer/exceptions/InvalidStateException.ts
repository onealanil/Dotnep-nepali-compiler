export class InvalidStateException extends Error{
    constructor(message: string){
        super(message);
        this.name = "InvalidStateException";
    }
}