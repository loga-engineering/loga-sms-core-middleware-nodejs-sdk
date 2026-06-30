export interface SMSSendRequest {
    receiverAddress: string;
    message: string;
    senderName?: string;
    callbackUrl?: string;
    priority: string;
}
