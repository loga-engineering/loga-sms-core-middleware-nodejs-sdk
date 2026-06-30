import * as crypto from 'crypto';
import {HttpClient} from '../http/HttpClient';
import {TokenManager} from '../auth/TokenManager';
import {LogaSmsError} from '../errors/LogaSmsError';
import {SmsPriority} from '../models/SmsPriority';
import type {SMSSendRequest} from '../models/SMSSendRequest';
import type {SMSSendResponse} from '../models/SMSSendResponse';
import type {SmsStatusResponse} from '../models/SmsStatusResponse';
import type {LogaSmsClientOptions} from './LogaSmsClientOptions';

interface CheckStatusOptions {
  externalRefNo?: string;
  idempotencyKey?: string;
}

const DEFAULT_BASE_URL = 'https://api.sms.loga-apps.com';

function generateIdempotencyKey(): string {
    return crypto.randomBytes(16).toString('hex');
}

function loadConfig(options: LogaSmsClientOptions) {
    return {
        clientId: options.clientId || process.env.LOGA_SMS_CLIENT_ID || '',
        clientSecret: options.clientSecret || process.env.LOGA_SMS_CLIENT_SECRET || '',
        apiKey: options.apiKey || process.env.LOGA_SMS_API_KEY || '',
        baseUrl: options.baseUrl || process.env.LOGA_SMS_BASE_URL || DEFAULT_BASE_URL,
        defaultSenderName: options.defaultSenderName || process.env.LOGA_SMS_DEFAULT_SENDER_NAME,
        defaultCallbackUrl: options.defaultCallbackUrl || process.env.LOGA_SMS_DEFAULT_CALLBACK_URL,
    };
}

export class LogaSmsClient {
    private readonly config: ReturnType<typeof loadConfig>;
    private readonly httpClient: HttpClient;
    private readonly tokenManager?: TokenManager;

    constructor(options: LogaSmsClientOptions = {}) {
        this.config = loadConfig(options);

        if (!this.config.apiKey) {
            throw new LogaSmsError('LOGA SMS API Key is required');
        }

        this.httpClient = new HttpClient(this.config.baseUrl, this.config.apiKey, options.timeout);

        if (this.config.clientId && this.config.clientSecret) {
            this.tokenManager = new TokenManager(
                `${this.config.baseUrl}/oauth/v1/token`,
                this.config.clientId,
                this.config.clientSecret,
            );
        }
    }

    private async authenticate(): Promise<void> {
        if (!this.tokenManager) return;

        const token = await this.tokenManager.getAccessToken();
        this.httpClient.setAuthorizationHeader(token);
    }

    async send(
        to: string,
        message: string,
        options: {
            priority?: SmsPriority;
            senderName?: string;
            callbackUrl?: string;
            idempotencyKey?: string;
        } = {},
    ): Promise<SMSSendResponse> {
        const attempt = async (): Promise<SMSSendResponse> => {
            await this.authenticate();

            const request: SMSSendRequest = {
                receiverAddress: to,
                message,
                priority: options.priority || SmsPriority.QUEUED,
                senderName: options.senderName || this.config.defaultSenderName,
                callbackUrl: options.callbackUrl || this.config.defaultCallbackUrl,
            };

            const idempotencyKey = options.idempotencyKey || generateIdempotencyKey();

            return this.httpClient.post<SMSSendResponse>(
                '/api/smsmessaging/v1/outbound/send',
                request,
                {'Idempotency-Key': idempotencyKey},
            );
        };

        try {
            return await attempt();
        } catch (error: unknown) {
            if (this.isUnauthorized(error)) {
                this.tokenManager?.invalidate();
                return attempt();
            }
            throw this.normalizeError(error);
        }
    }

    async checkStatus(externalRefNoOrOptions: string | CheckStatusOptions): Promise<SmsStatusResponse> {
        const params: Record<string, string> = {};
        if (typeof externalRefNoOrOptions === 'string') {
            params.externalRefNo = externalRefNoOrOptions;
        } else {
            if (externalRefNoOrOptions.externalRefNo) {
                params.externalRefNo = externalRefNoOrOptions.externalRefNo;
            } else if (externalRefNoOrOptions.idempotencyKey) {
                params.idempotencyKey = externalRefNoOrOptions.idempotencyKey;
            } else {
                throw new LogaSmsError('Either externalRefNo or idempotencyKey is required');
            }
        }

        const attempt = async (): Promise<SmsStatusResponse> => {
            await this.authenticate();
            return this.httpClient.get<SmsStatusResponse>(
                '/api/smsmessaging/v1/status',
                params,
            );
        };

        try {
            return await attempt();
        } catch (error: unknown) {
            if (this.isUnauthorized(error)) {
                this.tokenManager?.invalidate();
                return attempt();
            }
            throw this.normalizeError(error);
        }
    }

    private isUnauthorized(error: unknown): boolean {
        if (error && typeof error === 'object' && 'response' in error) {
            const resp = (error as any).response;
            return resp?.status === 401;
        }
        return false;
    }

    private normalizeError(error: unknown): Error {
        if (error && typeof error === 'object' && 'response' in error) {
            const resp = (error as any).response;
            return new LogaSmsError(
                resp?.data?.message || resp?.data || 'Unknown API error',
                resp?.status,
                typeof resp?.data === 'string' ? resp.data : JSON.stringify(resp?.data),
            );
        }
        if (error instanceof Error) return error;
        return new LogaSmsError(String(error));
    }
}
