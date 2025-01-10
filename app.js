class ChatUI {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

       
        this.setupNavigation();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

              
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
    }

    addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = message;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message) return;

        
        this.userInput.disabled = true;
        this.sendButton.disabled = true;

        this.addMessage(message, true);
        this.userInput.value = '';

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (response.ok && data.response) {
                this.addMessage(data.response);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('An error occurred. Please try again.');
        }

        // Re-enable input and button
        this.userInput.disabled = false;
        this.sendButton.disabled = false;
        this.userInput.focus();
    }
}

// Initialize the chat UI when the page loads
window.addEventListener('load', () => {
    new ChatUI();
});