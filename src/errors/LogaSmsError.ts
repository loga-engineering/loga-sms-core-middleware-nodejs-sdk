export class LogaSmsError extends Error {
    public readonly statusCode?: number;
    public readonly body?: string;

    constructor(message: string, statusCode?: number, body?: string) {
        super(message);
        this.name = 'LogaSmsError';
        this.statusCode = statusCode;
        this.body = body;
    }
}
