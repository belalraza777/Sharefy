export default class ErrorHandle extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}