import 'dotenv/config';
import express from 'express';
import { LogaSmsClient, SmsPriority } from '@loga-engineering/sms-sdk';

const app = express();
app.use(express.json());

const smsClient = new LogaSmsClient({
  clientId: process.env.LOGA_SMS_CLIENT_ID,
  clientSecret: process.env.LOGA_SMS_CLIENT_SECRET,
  apiKey: process.env.LOGA_SMS_API_KEY,
  baseUrl: process.env.LOGA_SMS_BASE_URL,
  defaultSenderName: process.env.LOGA_SMS_DEFAULT_SENDER_NAME,
  defaultCallbackUrl: process.env.LOGA_SMS_DEFAULT_CALLBACK_URL,
});

// POST /sms/send/default — utiliser le senderName et callbackUrl par défaut
app.post('/sms/send/default', async (req, res) => {
  try {
    const { to, message } = req.body;
    const response = await smsClient.send(to, message);
    res.json({
      externalRefNo: response.externalRefNo,
      status: response.status,
      message: response.message,
      mode: 'default sender + default callback',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sms/send/custom-sender — senderName personnalisé
app.post('/sms/send/custom-sender', async (req, res) => {
  try {
    const { to, message, senderName } = req.body;
    const response = await smsClient.send(to, message, { senderName });
    res.json({
      externalRefNo: response.externalRefNo,
      status: response.status,
      message: response.message,
      mode: `custom sender: ${senderName}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sms/send/custom-callback — callbackUrl personnalisé
app.post('/sms/send/custom-callback', async (req, res) => {
  try {
    const { to, message, callbackUrl } = req.body;
    const response = await smsClient.send(to, message, { callbackUrl });
    res.json({
      externalRefNo: response.externalRefNo,
      status: response.status,
      message: response.message,
      mode: `custom callback: ${callbackUrl}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sms/send/full — contrôle complet
app.post('/sms/send/full', async (req, res) => {
  try {
    const { to, message, senderName, callbackUrl, priority } = req.body;

    if (priority && !Object.values(SmsPriority).includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority. Use: INSTANT, TRANSACTION, CAMPAIGN, QUEUED',
      });
    }

    const response = await smsClient.send(to, message, {
      senderName,
      callbackUrl,
      priority: priority || SmsPriority.QUEUED,
    });
    res.json({
      externalRefNo: response.externalRefNo,
      status: response.status,
      message: response.message,
      mode: 'full control',
      priority: priority || 'QUEUED',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /sms/status — vérifier le statut d'un SMS
app.get('/sms/status', async (req, res) => {
  try {
    const { externalRefNo, idempotencyKey } = req.query;
    const status = await smsClient.checkStatus(externalRefNo || { idempotencyKey });
    res.json({
      externalRefNo: status.externalRefNo,
      status: status.status,
      receiverAddress: status.receiverAddress,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
      message: status.message,
    });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Loga SMS sample app running on http://localhost:${PORT}`);
});
