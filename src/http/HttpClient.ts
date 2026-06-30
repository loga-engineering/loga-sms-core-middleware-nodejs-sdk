import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

export class HttpClient {
    private readonly client: AxiosInstance;

    constructor(baseURL: string, apiKey: string, timeout = 30000) {
        this.client = axios.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
        });
    }

    setAuthorizationHeader(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    removeAuthorizationHeader(): void {
        delete this.client.defaults.headers.common['Authorization'];
    }

    async post<T>(url: string, data: unknown, extraHeaders?: Record<string, string>): Promise<T> {
        const config: AxiosRequestConfig = {};
        if (extraHeaders) {
            config.headers = extraHeaders;
        }
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    async get<T>(url: string, params?: Record<string, string>): Promise<T> {
        const response = await this.client.get<T>(url, {params});
        return response.data;
    }
}
