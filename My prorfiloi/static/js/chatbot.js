document.addEventListener('DOMContentLoaded', function() {
    const chatbotHTML = `
        <div class="chatbot-container">
            <div class="chat-button">
                <i class="fas fa-comments"></i>
            </div>
            <div class="chat-window">
                <div class="chat-header">
                    <span>Chat with Ganesh</span>
                    <i class="fas fa-times" id="close-chat"></i>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message...">
                    <button><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const chatButton = document.querySelector('.chat-button');
    const chatWindow = document.querySelector('.chat-window');
    const closeChat = document.querySelector('#close-chat');
    const messageInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');
    const messagesContainer = document.querySelector('.chat-messages');

    const contactInfo = {
        email: 'ganeshmogal35@gmail.com',
        phone: '9511951568'
    };

    const predefinedQuestions = [
        'Tell me about yourself',
        'What are your skills?',
        'How can I contact you?',
        'Show me your projects'
    ];

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function addQuickReplies() {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.className = 'quick-replies';
        predefinedQuestions.forEach(question => {
            const reply = document.createElement('div');
            reply.className = 'quick-reply';
            reply.textContent = question;
            reply.onclick = () => handleUserInput(question);
            quickRepliesDiv.appendChild(reply);
        });
        messagesContainer.appendChild(quickRepliesDiv);
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv;
    }

    function handleUserInput(input) {
        addMessage(input, true);
        const typingIndicator = showTypingIndicator();
        
        const response = generateResponse(input.toLowerCase());
        setTimeout(() => {
            typingIndicator.remove();
            addMessage(response);
            if (messagesContainer.querySelectorAll('.message').length === 2) {
                addQuickReplies();
            }
        }, 1500);
    }

    function generateResponse(input) {
        if (input.includes('about yourself')) {
            return 'I am Ganesh Mogal, a Full Stack Developer & Python Enthusiast. I specialize in web development and machine learning technologies.';
        } else if (input.includes('skills')) {
            return 'I am skilled in: Frontend (HTML, CSS, JavaScript, React), Backend (Python, SQL), and various tools like Git & GitHub. I also have experience with Machine Learning frameworks.';
        } else if (input.includes('contact')) {
            return `You can reach me at:\nEmail: ${contactInfo.email}\nPhone: ${contactInfo.phone}`;
        } else if (input.includes('projects')) {
            return 'I have worked on several projects including a Buying Selling Auction Platform, Portfolio Website, and Depression Detection using BERT Algorithm. You can check them out in the Projects section above.';
        } else {
            return 'I\'m happy to help! You can ask me about my skills, projects, or how to contact me.';
        }
    }

    chatButton.addEventListener('click', () => {
        chatWindow.classList.add('active');
        if (messagesContainer.children.length === 0) {
            addMessage('Hi! I\'m Ganesh\'s virtual assistant. How can I help you today?');
            addQuickReplies();
        }
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim()) {
            handleUserInput(messageInput.value.trim());
            messageInput.value = '';
        }
    });

    sendButton.addEventListener('click', () => {
        if (messageInput.value.trim()) {
            handleUserInput(messageInput.value.trim());
            messageInput.value = '';
        }
    });
});