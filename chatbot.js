import readline from 'readline-sync';
import dotenv from "dotenv";
dotenv.config();

class LangflowClient {
    constructor(baseURL, applicationToken) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }

    async post(endpoint, body, headers = {"Content-Type": "application/json"}) {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;
        headers["Content-Type"] = "application/json";
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
            }
            return responseMessage;
        } catch (error) {
            console.error('Request Error:', error.message);
            throw error;
        }
    }

    async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
    }

    async runFlow(flowIdOrName, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}) {
        try {
            const initResponse = await this.initiateSession(flowIdOrName, langflowId, inputValue, inputType, outputType, false, tweaks);
            if (initResponse && initResponse.outputs) {
                const flowOutputs = initResponse.outputs[0];
                const firstComponentOutputs = flowOutputs.outputs[0];
                const output = firstComponentOutputs.outputs.message;
                return output.message.text;
            }
            return null;
        } catch (error) {
            console.error('Error running flow:', error);
            throw error;
        }
    }
}

async function chat() {
    const flowIdOrName = process.env.flowIdOrName;
    const langflowId = process.env.langflowId;
    const applicationToken = process.env.applicationToken;
    const LANGFLOW_BASE_URL=process.env.LANGFLOW_BASE_URL;
    const langflowClient = new LangflowClient(
        LANGFLOW_BASE_URL,
        applicationToken
    );

    const tweaks = {
        "ChatInput-7syrU": {},
        "Prompt-fNxTD": {},
        "ChatOutput-8arYt": {},
        "AstraDBToolComponent-N3JxA": {},
        "Agent-HxJaP": {}
    };

    console.log("Welcome to the Langflow Chatbot!");
    console.log("Type 'exit' to end the conversation.\n");

    while (true) {
        const userInput = readline.question("You: ");
        
        if (userInput.toLowerCase() === 'exit') {
            console.log("\nGoodbye!");
            break;
        }

        try {
            const response = await langflowClient.runFlow(
                flowIdOrName,
                langflowId,
                userInput,
                'chat',
                'chat',
                tweaks
            );
            
            console.log("\nBot:", response, "\n");
        } catch (error) {
            console.error("Error:", error.message);
            console.log("Please try again.\n");
        }
    }
}

chat();