import axios from 'axios';
import type {OAuth2TokenResponse} from '../models/OAuth2TokenResponse';

export class TokenManager {
    private accessToken?: string;
    private tokenExpiresAt = 0;

    constructor(
        private readonly tokenUrl: string,
        private readonly clientId: string,
        private readonly clientSecret: string,
    ) {
    }

    invalidate(): void {
        this.accessToken = undefined;
        this.tokenExpiresAt = 0;
    }

    async getAccessToken(): Promise<string> {
        const now = Math.floor(Date.now() / 1000);
        if (this.accessToken && now < this.tokenExpiresAt - 60) {
            return this.accessToken;
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('clientId', this.clientId);
        params.append('clientSecret', this.clientSecret);

        const response = await axios.post<OAuth2TokenResponse>(
            this.tokenUrl,
            params,
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
        );

        this.accessToken = response.data.access_token;
        this.tokenExpiresAt = now + response.data.expires_in;
        return this.accessToken;
    }
}
