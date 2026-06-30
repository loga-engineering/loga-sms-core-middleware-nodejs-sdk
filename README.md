# Loga SMS Node.js SDK

<p align="left">
  <a href="https://www.npmjs.com/package/@loga-engineering/sms-sdk"><img src="https://img.shields.io/npm/v/@loga-engineering/sms-sdk" alt="npm version"></a>
  <a href="https://github.com/loga-engineering/loga-sms-nodejs-sdk/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/language-TypeScript-3178C6" alt="TypeScript"></a>
</p>

**Official Node.js/TypeScript SDK for the Loga SMS Core Middleware API** — send and track SMS messages programmatically.

## Features

- SMS sending with `QUEUED`, `INSTANT`, `TRANSACTION`, `CAMPAIGN` priorities
- Delivery status checking by `externalRefNo` or `idempotencyKey`
- OAuth2 client credentials authentication with automatic token refresh + 401 retry
- Idempotency-Key support (header-based, Stripe convention) — auto-generated if not provided
- Full TypeScript support with type declarations
- Environment variable or constructor configuration
- Configurable HTTP timeout
- Promise-based API (async/await)
- Node.js 18+ compatible

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @loga-engineering/sms-sdk
```

## Quick Start

```typescript
import { LogaSmsClient } from '@loga-engineering/sms-sdk';

const client = new LogaSmsClient();
const response = await client.send('+22370000000', 'Hello from Node.js!');
console.log('Sent:', response.externalRefNo);

// Check delivery status
const status = await client.checkStatus(response.externalRefNo);
console.log('Status:', status.status);
```

## Configuration

Configure via **environment variables** or pass options to the **constructor**.

| Environment Variable | Constructor Option | Required | Default |
|---|---|---|---|
| `LOGA_SMS_CLIENT_ID` | `clientId` | For OAuth | — |
| `LOGA_SMS_CLIENT_SECRET` | `clientSecret` | For OAuth | — |
| `LOGA_SMS_API_KEY` | `apiKey` | Yes | — |
| `LOGA_SMS_BASE_URL` | `baseUrl` | No | `https://api.sms.loga-apps.com` |
| `LOGA_SMS_DEFAULT_SENDER_NAME` | `defaultSenderName` | No | — |
| `LOGA_SMS_DEFAULT_CALLBACK_URL` | `defaultCallbackUrl` | No | — |
| _(none)_ | `timeout` | No | (default 30s) |

## Usage

### Creating a Client

```typescript
import { LogaSmsClient } from '@loga-engineering/sms-sdk';

// Using environment variables
const client = new LogaSmsClient();

// Using options (overrides environment variables)
const client = new LogaSmsClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.sms.loga-apps.com',
  defaultSenderName: 'MyApp',
  defaultCallbackUrl: 'https://myapp.com/webhook/sms-status',
  timeout: 15_000,
});
```

### Sending SMS

```typescript
import { LogaSmsClient, SmsPriority } from '@loga-engineering/sms-sdk';

const client = new LogaSmsClient();

// Simple send (QUEUED priority, defaults)
const result = await client.send('+22370000000', 'Hello World!');

// With all options
const result = await client.send('+22370000000', 'Hello World!', {
  senderName: 'MyApp',
  priority: SmsPriority.INSTANT,
  callbackUrl: 'https://myapp.com/webhook/sms-status',
  idempotencyKey: 'my-unique-key-123',
});
```

### Checking Status

```typescript
// By external reference number
const status = await client.checkStatus('EXT-REF-12345');
console.log(status.status); // e.g. "SENT"
console.log(status.receiverAddress);
console.log(status.createdAt);

// By idempotency key
const status = await client.checkStatus({ idempotencyKey: 'my-idempotency-key-456' });
console.log(status.status);

// By either (options object)
const status = await client.checkStatus({ externalRefNo: 'EXT-REF-12345' });
```

### Error Handling

```typescript
import { LogaSmsClient, LogaSmsError } from '@loga-engineering/sms-sdk';

try {
  const result = await client.send('+22370000000', 'Hello!');
} catch (error) {
  if (error instanceof LogaSmsError) {
    console.error('API Error:', error.statusCode, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## API Reference

### LogaSmsClient

| Method | Parameters | Description |
|---|---|---|
| `send()` | `to: string, message: string, options?: SendOptions` | Send an SMS with optional priority, sender name, callback URL, and idempotency key |
| `checkStatus()` | `externalRefNo: string` | Check status by external reference number |
| `checkStatus()` | `options: { externalRefNo?: string, idempotencyKey?: string }` | Check status by either reference or idempotency key |

### Types

| Type / Interface | Description |
|---|---|
| `LogaSmsClient` | Main SDK client |
| `LogaSmsClientOptions` | Constructor options (all fields optional) |
| `SendOptions` | `{ priority?, senderName?, callbackUrl?, idempotencyKey? }` |
| `SmsPriority` | Enum: `QUEUED`, `INSTANT`, `TRANSACTION`, `CAMPAIGN` |
| `SMSSendResponse` | `{ externalRefNo, status, message }` |
| `SmsStatusResponse` | `{ externalRefNo, status, receiverAddress, createdAt, updatedAt, message }` |
| `LogaSmsError` | Typed error with `statusCode` and `message` |

## Examples

See the [Express app example](./examples/express-app/) for a full REST integration with multiple send modes and status checking.
