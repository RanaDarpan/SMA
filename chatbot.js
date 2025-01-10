import readline from 'readline-sync';

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
    const flowIdOrName = '32ef7cd3-c5df-4460-a5b2-ee2696efa5b1';
    const langflowId = 'ac4ec456-dfb1-4a66-9866-fde97acd8a16';
    const applicationToken = 'AstraCS:bQhhCvQmUvtDogFyrugaXyds:fa8b3ba5d3e7562d22b68083dd2a36a974921538d48f444b4cf74b2acdbfb88c';
    
    const langflowClient = new LangflowClient(
        'https://api.langflow.astra.datastax.com',
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