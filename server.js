import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const LANGFLOW_BASE_URL = 'https://api.langflow.astra.datastax.com';
const APPLICATION_TOKEN = 'AstraCS:bQhhCvQmUvtDogFyrugaXyds:fa8b3ba5d3e7562d22b68083dd2a36a974921538d48f444b4cf74b2acdbfb88c';

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const flowId = '32ef7cd3-c5df-4460-a5b2-ee2696efa5b1';
        const langflowId = 'ac4ec456-dfb1-4a66-9866-fde97acd8a16';
        
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=false`;
        const url = `${LANGFLOW_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${APPLICATION_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input_value: message,
                input_type: 'chat',
                output_type: 'chat',
                tweaks: {
                    "ChatInput-7syrU": {},
                    "Prompt-fNxTD": {},
                    "ChatOutput-8arYt": {},
                    "AstraDBToolComponent-N3JxA": {},
                    "Agent-HxJaP": {}
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'Failed to get response from Langflow');
        }

        const output = data.outputs[0].outputs[0].outputs.message.message.text;
        res.json({ response: output });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});