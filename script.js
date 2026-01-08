// Initialize elements
let chatMessages, userInput, sendButton;

function animateTextStream(element, text, callback) {
    let currentIndex = 0;
    let isInTag = false;
    let tagBuffer = '';
    let displayText = '';
    
    const stream = () => {
        if (currentIndex >= text.length) {
            if (callback) callback();
            return;
        }
        
        const char = text[currentIndex];
        
        if (char === '<') {
            isInTag = true;
            tagBuffer = char;
            currentIndex++;
            stream();
            return;
        }
        
        if (isInTag) {
            tagBuffer += char;
            if (char === '>') {
                isInTag = false;
                displayText += tagBuffer;
                element.innerHTML = displayText;
                currentIndex++;
                // Faster for tags
                setTimeout(stream, 1);
                return;
            }
            currentIndex++;
            stream();
            return;
        }
        
        displayText += char;
        element.innerHTML = displayText;
        currentIndex++;
        
        // Smooth scroll during streaming (every few characters)
        if (currentIndex % 10 === 0) {
            scrollToBottom();
        }
        
        // Variable speed: faster animation
        let delay = 1;
        if (char === ' ') {
            delay = 0;
        } else if (char === '.' || char === '!' || char === '?') {
            delay = 2;
        } else if (char === ',') {
            delay = 1;
        }
        
        setTimeout(stream, delay);
    };
    
    stream();
}

function addSystemMessage(text) {
    const messages = document.getElementById('chatMessages');
    if (!messages) {
        console.error('chatMessages element not found');
        return;
    }
    
    // Hide welcome screen and suggested queries when adding a message
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    const suggestedQueries = document.getElementById('suggestedQueries');
    if (suggestedQueries) {
        suggestedQueries.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(8px)';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    content.appendChild(paragraph);
    
    messageDiv.appendChild(content);
    messages.appendChild(messageDiv);
    
    // Animate in
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
        scrollToBottom();
    });
}

function addMessage(text, isUser, sources = null, files = null, showGraph = false) {
    const messages = document.getElementById('chatMessages');
    if (!messages) {
        console.error('chatMessages element not found');
        return;
    }
    
    // Hide welcome screen and suggested queries when adding a message
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    const suggestedQueries = document.getElementById('suggestedQueries');
    if (suggestedQueries) {
        suggestedQueries.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(8px)';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    const paragraph = document.createElement('p');
    
    // Simple markdown support for bold (**text**)
    let formattedText = text;
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // For user messages, show immediately
    if (isUser) {
        paragraph.innerHTML = formattedText;
        content.appendChild(paragraph);
        
        // Add file attachments if provided
        if (files && files.length > 0) {
            files.forEach(file => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                attachmentDiv.innerHTML = `
                    <svg class="message-attachment-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>FILE</span>
                `;
                content.appendChild(attachmentDiv);
            });
        }
        
        messageDiv.appendChild(content);
        messages.appendChild(messageDiv);
        
        // Animate in
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
            // Scroll after animation
            scrollToBottom();
            setTimeout(() => {
                scrollToBottom();
            }, 350);
        });
        
        scrollToBottom();
        return;
    }
    
    // For AI messages, start with empty paragraph and stream text
    paragraph.innerHTML = '';
    content.appendChild(paragraph);
    messageDiv.appendChild(content);
    
    messages.appendChild(messageDiv);
    scrollToBottom();
    
    // Animate message container in
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
        
        // Start streaming text after a short delay
        setTimeout(() => {
            animateTextStream(paragraph, formattedText, () => {
                // Text streaming complete, add graph if needed
                if (showGraph) {
                    setTimeout(() => {
                        addFTEGraph(content);
                    }, 200);
                }
                // Add feedback buttons
                setTimeout(() => {
                    addAIMessageElements(messageDiv, sources);
                    // Scroll after elements are added
                    setTimeout(() => {
                        scrollToBottom();
                    }, 50);
                }, 100);
            });
        }, 100);
    });
}

function addAIMessageElements(messageDiv, sources = null) {
    // Add feedback buttons
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'message-feedback';
    feedbackDiv.style.opacity = '0';
    
    const thumbsUp = document.createElement('button');
    thumbsUp.className = 'feedback-button thumbs-up';
    thumbsUp.setAttribute('aria-label', 'Thumbs up');
    const thumbsUpImg = document.createElement('img');
    thumbsUpImg.src = 'thumbs-up.svg';
    thumbsUpImg.alt = 'Thumbs up';
    thumbsUp.appendChild(thumbsUpImg);
    
    const thumbsUpTooltip = document.createElement('div');
    thumbsUpTooltip.className = 'feedback-tooltip';
    thumbsUpTooltip.textContent = 'Helpful';
    thumbsUp.appendChild(thumbsUpTooltip);
    
    // Add click handler for thumbs up
    thumbsUp.addEventListener('click', (e) => {
        e.stopPropagation();
        handleFeedbackClick(thumbsUp, true);
    });
    
    const thumbsDown = document.createElement('button');
    thumbsDown.className = 'feedback-button thumbs-down';
    thumbsDown.setAttribute('aria-label', 'Thumbs down');
    const thumbsDownImg = document.createElement('img');
    thumbsDownImg.src = 'thumbs-down.svg';
    thumbsDownImg.alt = 'Thumbs down';
    thumbsDown.appendChild(thumbsDownImg);
    
    const thumbsDownTooltip = document.createElement('div');
    thumbsDownTooltip.className = 'feedback-tooltip';
    thumbsDownTooltip.textContent = 'Not helpful';
    thumbsDown.appendChild(thumbsDownTooltip);
    
    // Add click handler for thumbs down
    thumbsDown.addEventListener('click', (e) => {
        e.stopPropagation();
        handleFeedbackClick(thumbsDown, false);
    });
    
    feedbackDiv.appendChild(thumbsUp);
    feedbackDiv.appendChild(thumbsDown);
    messageDiv.appendChild(feedbackDiv);
    
    // Animate feedback buttons in
    requestAnimationFrame(() => {
        feedbackDiv.style.transition = 'opacity 0.3s ease-in';
        feedbackDiv.style.opacity = '1';
        // Scroll after feedback buttons are visible
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    });
    
    // Add sources if provided
    if (sources && sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'message-sources';
        sourcesDiv.style.opacity = '0';
        
        const sourcesButton = document.createElement('button');
        sourcesButton.className = 'sources-toggle';
        sourcesButton.innerHTML = `Show ${sources.length} source${sources.length > 1 ? 's' : ''} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        
        const sourcesList = document.createElement('div');
        sourcesList.className = 'sources-list';
        sourcesList.style.display = 'none';
        
        // Generate source links
        const sourceData = getSourceData(sources);
        sourceData.forEach((source, index) => {
            const sourceLink = document.createElement('a');
            sourceLink.href = source.url || '#';
            sourceLink.target = '_blank';
            sourceLink.rel = 'noopener noreferrer';
            sourceLink.className = 'source-link';
            sourceLink.textContent = `${index + 1}. ${source.title}`;
            sourcesList.appendChild(sourceLink);
        });
        
        // Toggle functionality
        let isExpanded = false;
        sourcesButton.addEventListener('click', () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                sourcesList.style.display = 'flex';
                sourcesButton.innerHTML = `Hide ${sources.length} source${sources.length > 1 ? 's' : ''} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`;
                sourcesButton.classList.add('expanded');
                // Scroll to bottom when sources are expanded
                setTimeout(() => {
                    scrollToBottom();
                }, 50);
            } else {
                sourcesList.style.display = 'none';
                sourcesButton.innerHTML = `Show ${sources.length} source${sources.length > 1 ? 's' : ''} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
                sourcesButton.classList.remove('expanded');
            }
        });
        
        sourcesDiv.appendChild(sourcesButton);
        sourcesDiv.appendChild(sourcesList);
        messageDiv.appendChild(sourcesDiv);
        
        // Animate sources in
        requestAnimationFrame(() => {
            sourcesDiv.style.transition = 'opacity 0.3s ease-in';
            sourcesDiv.style.opacity = '1';
            // Scroll after sources are visible
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        });
    }
}

function handleFeedbackClick(button, isHelpful) {
    // Add press animation class
    button.classList.add('pressed');
    
    // Remove the class after animation completes
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 300);
    
    // TODO: Send feedback to backend
    console.log(`Feedback: ${isHelpful ? 'Helpful' : 'Not helpful'}`);
    
    // Optional: Disable both buttons after one is clicked
    const feedbackDiv = button.closest('.message-feedback');
    if (feedbackDiv) {
        const allButtons = feedbackDiv.querySelectorAll('.feedback-button');
        allButtons.forEach(btn => {
            if (btn !== button) {
                btn.style.opacity = '0.4';
                btn.style.pointerEvents = 'none';
            }
        });
    }
}

function getSourceData(sourceNumbers) {
    // Mock source data - in a real implementation, this would come from the API
    const allSources = {
        1: {
            title: 'Company Policy Handbook - Vacation Days',
            url: '#'
        },
        2: {
            title: 'HR Portal - Employee Benefits Guide',
            url: '#'
        },
        3: {
            title: 'Job Description Template Library',
            url: '#'
        },
        4: {
            title: 'Performance Review Best Practices Guide',
            url: '#'
        },
        5: {
            title: 'Onboarding Process Documentation',
            url: '#'
        },
        6: {
            title: 'HR Framework Library - Review Templates',
            url: '#'
        }
    };
    
    return sourceNumbers.map(num => allSources[num] || {
        title: `Source ${num}`,
        url: '#'
    });
}

function showTypingIndicator() {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-message';
    typingDiv.id = 'typingIndicator';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingIndicator.appendChild(dot);
    }
    content.appendChild(typingIndicator);
    
    typingDiv.appendChild(content);
    messages.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function addFTEGraph(container) {
    // FTE data for last 12 months (sample data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fteData = [228, 232, 235, 238, 240, 242, 240, 243, 245, 247, 244, 242];
    
    const maxValue = Math.max(...fteData);
    const minValue = Math.min(...fteData);
    const range = maxValue - minValue;
    const chartHeight = 200;
    const chartWidth = 600;
    const barWidth = (chartWidth - 40) / 12;
    const padding = 20;
    
    const graphContainer = document.createElement('div');
    graphContainer.className = 'fte-graph-container';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', chartWidth);
    svg.setAttribute('height', chartHeight + 60);
    svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight + 60}`);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    
    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', chartWidth);
    bg.setAttribute('height', chartHeight + 60);
    bg.setAttribute('fill', '#fafafa');
    bg.setAttribute('rx', '8');
    svg.appendChild(bg);
    
    // Grid lines
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', chartWidth - padding);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(0, 0, 0, 0.05)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
    
    // Bars
    fteData.forEach((value, index) => {
        const barHeight = ((value - minValue) / range) * chartHeight;
        const x = padding + index * barWidth + barWidth * 0.1;
        const y = padding + chartHeight - barHeight;
        const width = barWidth * 0.8;
        
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', x);
        bar.setAttribute('y', y);
        bar.setAttribute('width', width);
        bar.setAttribute('height', barHeight);
        bar.setAttribute('fill', '#9773FF');
        bar.setAttribute('rx', '4');
        bar.setAttribute('opacity', '0');
        svg.appendChild(bar);
        
        // Animate bar
        setTimeout(() => {
            bar.style.transition = 'opacity 0.3s ease, height 0.5s ease';
            bar.setAttribute('opacity', '1');
        }, index * 50);
        
        // Value label on top of bar
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', x + width / 2);
        valueText.setAttribute('y', y - 5);
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('font-size', '11');
        valueText.setAttribute('font-weight', '500');
        valueText.setAttribute('fill', '#1a1a1a');
        valueText.setAttribute('opacity', '0');
        valueText.textContent = value;
        svg.appendChild(valueText);
        
        setTimeout(() => {
            valueText.style.transition = 'opacity 0.3s ease';
            valueText.setAttribute('opacity', '1');
        }, index * 50 + 300);
        
        // Month label
        const monthText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        monthText.setAttribute('x', x + width / 2);
        monthText.setAttribute('y', chartHeight + padding + 20);
        monthText.setAttribute('text-anchor', 'middle');
        monthText.setAttribute('font-size', '11');
        monthText.setAttribute('fill', '#6b7280');
        monthText.textContent = months[index];
        svg.appendChild(monthText);
    });
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const value = Math.round(minValue + (range / 5) * (5 - i));
        const y = padding + (chartHeight / 5) * i;
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', padding - 8);
        label.setAttribute('y', y + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('font-size', '10');
        label.setAttribute('fill', '#9ca3af');
        label.textContent = value;
        svg.appendChild(label);
    }
    
    graphContainer.appendChild(svg);
    container.appendChild(graphContainer);
    
    // Scroll after graph is added
    setTimeout(() => {
        scrollToBottom();
    }, 100);
}

function scrollToBottom() {
    const messages = document.getElementById('chatMessages');
    if (messages) {
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
            // Also try after a small delay to catch any late layout changes
            setTimeout(() => {
                messages.scrollTop = messages.scrollHeight;
            }, 10);
        });
    }
}

let thinkingTimeouts = [];
let isThinkingStopped = false;

function showThinkingStep(stepText, stepIndex) {
    const thinkingDiv = document.getElementById('thinkingProcess');
    if (!thinkingDiv || isThinkingStopped) return;
    
    const content = thinkingDiv.querySelector('.thinking-content');
    if (!content) return;
    
    const stepDiv = document.createElement('div');
    stepDiv.className = 'thinking-step';
    stepDiv.style.opacity = '0';
    stepDiv.style.transform = 'translateY(4px)';
    
    const stepIcon = document.createElement('div');
    stepIcon.className = 'thinking-step-icon';
    stepIcon.innerHTML = '<div class="thinking-dots"><span></span><span></span><span></span></div>';
    
    const stepTextDiv = document.createElement('div');
    stepTextDiv.className = 'thinking-step-text';
    stepTextDiv.textContent = stepText;
    
    stepDiv.appendChild(stepIcon);
    stepDiv.appendChild(stepTextDiv);
    content.appendChild(stepDiv);
    
    // Animate in
    setTimeout(() => {
        if (!isThinkingStopped) {
            stepDiv.style.transition = 'all 0.3s ease-out';
            stepDiv.style.opacity = '1';
            stepDiv.style.transform = 'translateY(0)';
        }
    }, 50);
    
    scrollToBottom();
}

function showThinkingProcess(steps, finalResponse, sources = null, showGraph = false) {
    // Reset stop flag
    isThinkingStopped = false;
    
    // Clear any existing timeouts
    thinkingTimeouts.forEach(timeout => clearTimeout(timeout));
    thinkingTimeouts = [];
    
    // Remove any existing thinking process
    const existingThinking = document.getElementById('thinkingProcess');
    if (existingThinking) {
        existingThinking.remove();
    }
    
    // Create thinking process container
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message ai thinking-process';
    thinkingDiv.id = 'thinkingProcess';
    
    const content = document.createElement('div');
    content.className = 'message-content thinking-content';
    thinkingDiv.appendChild(content);
    
    // Add stop button container (aligned with feedback buttons)
    const stopButtonContainer = document.createElement('div');
    stopButtonContainer.className = 'thinking-stop-container';
    const stopButton = document.createElement('button');
    stopButton.className = 'stop-thinking-button';
    stopButton.textContent = 'Stop';
    stopButton.type = 'button';
    stopButton.onclick = () => {
        isThinkingStopped = true;
        thinkingTimeouts.forEach(timeout => clearTimeout(timeout));
        thinkingTimeouts = [];
        thinkingDiv.remove();
        addMessage("Process stopped. How else can I help you?", false);
    };
    stopButtonContainer.appendChild(stopButton);
    content.appendChild(stopButtonContainer);
    
    const messages = document.getElementById('chatMessages');
    if (messages) {
        messages.appendChild(thinkingDiv);
        scrollToBottom();
    }
    
    // Show steps sequentially
    let stepDelay = 0;
    steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
            if (!isThinkingStopped) {
                showThinkingStep(step, index);
            }
        }, stepDelay);
        thinkingTimeouts.push(timeout);
        stepDelay += 1200; // 1.2 seconds between steps
    });
    
    // Show final response after all steps
    const finalTimeout = setTimeout(() => {
        if (!isThinkingStopped) {
            thinkingDiv.style.transition = 'opacity 0.2s ease-out';
            thinkingDiv.style.opacity = '0';
            setTimeout(() => {
                thinkingDiv.remove();
                addMessage(finalResponse, false, sources, null, showGraph);
            }, 200);
        }
        thinkingTimeouts = [];
    }, stepDelay + 800);
    thinkingTimeouts.push(finalTimeout);
}

function simulateAIResponse(userMessage) {
    const messageLower = userMessage.toLowerCase();
    
    // Check for preset queries
    if (messageLower.includes('job description') && messageLower.includes('senior software engineer')) {
        const steps = [
            'Looking into company job description templates...',
            'Reviewing similar roles and requirements...',
            'Compiling best practices for technical roles...'
        ];
        const response = `Here's a draft job description for a Senior Software Engineer position:

**Job Title:** Senior Software Engineer

**Department:** Engineering

**Reports To:** Engineering Manager

**Job Summary:**
We're looking for an experienced Senior Software Engineer to join our engineering team. You'll be responsible for designing, developing, and maintaining scalable software solutions while mentoring junior engineers and contributing to technical decision-making.

**Key Responsibilities:**
• Design and develop high-quality, scalable software solutions
• Lead technical architecture decisions and code reviews
• Mentor junior engineers and contribute to team growth
• Collaborate with cross-functional teams to deliver features
• Write clean, maintainable, and well-documented code
• Participate in agile development processes

**Required Qualifications:**
• 5+ years of software development experience
• Strong proficiency in [relevant technologies]
• Experience with system design and architecture
• Excellent problem-solving and communication skills

Would you like me to customize any specific sections or add more details?¹`;
        showThinkingProcess(steps, response, [3]);
        return;
    }
    
    if (messageLower.includes('performance review') || messageLower.includes('performance reviews')) {
        const steps = [
            'Accessing company performance review guidelines...',
            'Reviewing HR best practices and frameworks...',
            'Compiling recommendations based on industry standards...'
        ];
        const response = `Here are the best practices for conducting performance reviews:

**1. Preparation is Key**
• Review the employee's goals, achievements, and previous feedback
• Gather input from colleagues and stakeholders
• Prepare specific examples of performance

**2. Create a Safe Environment**
• Schedule in advance and choose a private, comfortable location
• Start with positive feedback to set a constructive tone
• Encourage two-way dialogue

**3. Use the SBI Framework**
• **Situation:** Describe the specific context
• **Behavior:** Focus on observable actions, not personality
• **Impact:** Explain the effect on team/company

**4. Set Clear Goals**
• Establish SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
• Align goals with company objectives
• Create development plans for growth areas

**5. Follow Up**
• Document the discussion and action items
• Schedule regular check-ins (not just annual reviews)
• Provide ongoing feedback and support

**Additional Tips:**
• Be specific and objective
• Focus on growth and development
• Address issues promptly, don't wait for review cycles
• Celebrate achievements and recognize contributions

Would you like templates or specific frameworks for your organization?¹²`;
        showThinkingProcess(steps, response, [4, 6]);
        return;
    }
    
    if (messageLower.includes('onboarding checklist') || messageLower.includes('onboarding')) {
        const steps = [
            'Reviewing company onboarding procedures...',
            'Checking standard checklist templates...',
            'Customizing checklist for new employee needs...'
        ];
        const response = `Here's a comprehensive onboarding checklist for new employees:

**Pre-Arrival (Before Day 1)**
☐ Send welcome email with first-day details
☐ Prepare workspace and equipment
☐ Set up accounts and access (email, systems, tools)
☐ Assign a buddy or mentor
☐ Prepare onboarding materials and documentation

**Day 1**
☐ Welcome meeting with manager
☐ Office tour and introductions
☐ Complete HR paperwork and benefits enrollment
☐ IT setup: computer, accounts, software access
☐ Review company handbook and policies
☐ Set up payroll and direct deposit

**Week 1**
☐ Team introductions and meet-and-greets
☐ Review job description and expectations
☐ Set initial goals and priorities
☐ Training on key tools and systems
☐ Schedule regular check-ins
☐ Assign first projects/tasks

**Month 1**
☐ Complete mandatory training courses
☐ Performance expectations discussion
☐ Feedback session with manager
☐ Integration into team workflows
☐ Review company culture and values
☐ Connect with key stakeholders

**Ongoing (First 90 Days)**
☐ Regular 1-on-1 meetings
☐ Progress reviews and feedback
☐ Professional development planning
☐ Social integration and team building

Would you like me to customize this for a specific role or department?¹`;
        showThinkingProcess(steps, response, [5]);
        return;
    }
    
    // Default responses for other queries
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        
        let response = "I understand you said: \"" + userMessage + "\". This is a simulated response. In a real implementation, this would connect to an AI service.";
        let sources = null;
        
        if (messageLower.includes('hello') || messageLower.includes('hi')) {
            response = "Hello! Nice to meet you. How can I assist you today?";
        } else if (messageLower.includes('help')) {
            response = "I'm here to help! Feel free to ask me anything, and I'll do my best to assist you.";
        } else if (messageLower.includes('thank')) {
            response = "You're welcome! Is there anything else I can help you with?";
        } else if (messageLower.includes('fte') || (messageLower.includes('graph') && messageLower.includes('12 months')) || (messageLower.includes('full-time') && messageLower.includes('months'))) {
            const steps = [
                'Retrieving FTE data from HRM system...',
                'Analyzing employee headcount trends...',
                'Generating visualization...'
            ];
            const response = `Here's the FTE (Full-Time Equivalent) trend over the last 12 months:

The data shows a steady growth pattern with some seasonal variations. The peak was in **October** with 247 FTEs, while the lowest point was in **January** at 228 FTEs. Overall, we've seen a **8.3% increase** in headcount over this period.¹

Would you like me to break this down by department or provide additional insights?²`;
            showThinkingProcess(steps, response, [1, 2], true); // Pass true to indicate we need a graph
            return;
        } else if (messageLower.includes('vacation') || messageLower.includes('days')) {
            response = "I can help with that. Based on my records¹, you currently have **14 vacation days remaining** for this year. 🌴 Did you know that you have two activity days per year to use as vacation as well?² If you have any further questions or need to request time off, feel free to ask or use the vacation request form here. Have a great day! 😊";
            sources = [1, 2];
        }
        
        addMessage(response, false, sources);
    }, 1000 + Math.random() * 1000);
}

function sendMessage() {
    // Get elements fresh each time to ensure they exist
    const input = document.getElementById('userInput');
    const button = document.getElementById('sendButton');
    const messages = document.getElementById('chatMessages');
    
    console.log('sendMessage called', { input, button, messages });
    
    if (!input) {
        console.error('userInput not found in sendMessage');
        return;
    }
    
    const message = input.value.trim();
    console.log('Message:', message);
    
    if (!message) {
        console.log('Empty message, returning');
        return;
    }
    
    // Hide suggested queries
    const suggestedQueries = document.getElementById('suggestedQueries');
    if (suggestedQueries) {
        suggestedQueries.style.display = 'none';
    }
    
    console.log('Adding message to chat');
    const fileInput = document.getElementById('fileInput');
    const files = window.pendingFiles || null;
    addMessage(message, true, null, files);
    input.value = '';
    
    // Clear pending files after sending
    if (window.pendingFiles) {
        window.pendingFiles = null;
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    if (button) {
        button.disabled = true;
    }
    
    console.log('Simulating AI response');
    simulateAIResponse(message);
}

// Event listeners are set up in the initialization block at the end

// Initial state - always expanded
const chatContainer = document.querySelector('.chat-container');
const welcomeMessage = document.getElementById('welcomeMessage');
const suggestedQueries = document.getElementById('suggestedQueries');

// Suggested queries handling is in the initialization block

// Initial button state is set in the initialization block

// Handle close button (disabled for now - will work on contracted state later)
const closeButton = document.querySelector('.close-button');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        // TODO: Implement contracted state later
        console.log('Close button clicked');
    });
}

// Handle agent archetype button and popover
let currentAgent = 'sia';
const agentButton = document.getElementById('agentButton');
const agentPopover = document.getElementById('agentPopover');
const agentOptions = document.querySelectorAll('.agent-option');

// Set initial selected agent
if (agentOptions.length > 0) {
    agentOptions[0].classList.add('selected');
}

if (agentButton && agentPopover) {
    const agentWrapper = agentButton.closest('.agent-selector-wrapper');
    
    agentButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isShowing = agentPopover.classList.contains('show');
        
        if (isShowing) {
            agentPopover.classList.remove('show');
        } else {
            // Close products popover if open
            const productsPopover = document.getElementById('productsPopover');
            if (productsPopover && productsPopover.classList.contains('show')) {
                productsPopover.classList.remove('show');
            }
            agentPopover.classList.add('show');
        }
    });
    
    // Handle agent selection
    agentOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const agentId = option.getAttribute('data-agent');
            const agentName = option.getAttribute('data-agent-name');
            
            // Only show system message if agent actually changed
            const previousAgent = currentAgent;
            
            // Update selected state
            agentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Update current agent
            currentAgent = agentId;
            
            // Close popover
            agentPopover.classList.remove('show');
            
            // Only show system message if agent changed (not initial selection)
            if (previousAgent !== agentId) {
                // Handle different agent types
                if (agentId === 'human') {
                    // Show system message that chat is being directed to human
                    addSystemMessage(`Your conversation is being directed to an HR expert. They'll be with you shortly.`);
                } else {
                    // Show system message for agent change
                    addSystemMessage(`Switched to ${agentName}`);
                    // In a real implementation, this would update the AI agent context
                }
            }
        });
    });
    
    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (agentWrapper && !agentWrapper.contains(e.target)) {
            agentPopover.classList.remove('show');
        }
    });
}

// Handle attachment button
const attachmentButton = document.querySelector('.attachment-button');
const fileInput = document.getElementById('fileInput');
if (attachmentButton && fileInput) {
    attachmentButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Files selected:', files);
            // Store files for the next message
            window.pendingFiles = Array.from(files);
        }
    });
}

// Handle products button and popover
let currentProduct = 'all';
const productsButton = document.getElementById('productsButton');
const productsPopover = document.getElementById('productsPopover');
const productOptions = document.querySelectorAll('.product-option');

if (productsButton && productsPopover) {
    const productsWrapper = productsButton.closest('.products-selector-wrapper');
    
    productsButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isShowing = productsPopover.classList.contains('show');
        
        if (isShowing) {
            productsPopover.classList.remove('show');
        } else {
            // Close agent popover if open
            const agentPopover = document.getElementById('agentPopover');
            if (agentPopover && agentPopover.classList.contains('show')) {
                agentPopover.classList.remove('show');
            }
            productsPopover.classList.add('show');
        }
    });
    
    // Handle product selection
    productOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = option.getAttribute('data-product');
            const productName = option.getAttribute('data-product-name');
            
            // Update selected state
            productOptions.forEach(opt => {
                opt.classList.remove('selected', 'product-option-selected');
            });
            option.classList.add('selected');
            
            // Update current product
            currentProduct = productId;
            
            // Update button text if not "All products"
            if (productId !== 'all') {
                const buttonSpan = productsButton.querySelector('span');
                if (buttonSpan) {
                    buttonSpan.textContent = productName;
                }
            } else {
                const buttonSpan = productsButton.querySelector('span');
                if (buttonSpan) {
                    buttonSpan.textContent = 'All products';
                }
            }
            
            // Close popover
            productsPopover.classList.remove('show');
            
            console.log(`Switched to product: ${productName}`);
            // In a real implementation, this would update the product context
        });
    });
    
    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (productsWrapper && !productsWrapper.contains(e.target)) {
            productsPopover.classList.remove('show');
        }
    });
}

// Handle feedback buttons in welcome message (using event delegation)
document.addEventListener('click', (e) => {
    if (e.target.closest('.welcome-message .thumbs-up')) {
        e.stopPropagation();
        handleFeedbackClick(e.target.closest('.thumbs-up'), true);
    } else if (e.target.closest('.welcome-message .thumbs-down')) {
        e.stopPropagation();
        handleFeedbackClick(e.target.closest('.thumbs-down'), false);
    }
});

// Old initializeChat function removed - using direct initialization below

// Simple, direct initialization - runs when script loads
console.log('Script loaded, readyState:', document.readyState);

function setupChat() {
    console.log('setupChat called');
    
    const input = document.getElementById('userInput');
    const button = document.getElementById('sendButton');
    const messages = document.getElementById('chatMessages');
    
    console.log('Elements check:', {
        input: !!input,
        button: !!button,
        messages: !!messages,
        sendMessage: typeof sendMessage
    });
    
    if (!input || !button || !messages) {
        console.error('Missing required elements!');
        return false;
    }
    
    if (typeof sendMessage !== 'function') {
        console.error('sendMessage function not found!');
        return false;
    }
    
    console.log('Setting up event handlers...');
    
    // Remove any existing handlers first
    button.onclick = null;
    input.onkeydown = null;
    input.oninput = null;
    
    // Set up send button
    button.addEventListener('click', function(e) {
        console.log('=== SEND BUTTON CLICKED ===');
        e.preventDefault();
        e.stopPropagation();
        try {
            sendMessage();
        } catch (err) {
            console.error('Error in sendMessage:', err);
        }
    }, true);
    
    // Also set onclick as backup
    button.onclick = function(e) {
        console.log('=== SEND BUTTON ONCLICK ===');
        e.preventDefault();
        e.stopPropagation();
        try {
            sendMessage();
        } catch (err) {
            console.error('Error in sendMessage:', err);
        }
    };
    
    // Set up input field
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            console.log('=== ENTER KEY PRESSED ===');
            e.preventDefault();
            try {
                sendMessage();
            } catch (err) {
                console.error('Error in sendMessage:', err);
            }
        }
    }, true);
    
    input.addEventListener('input', function() {
        button.disabled = !input.value.trim();
    });
    
    // Set initial button state
    button.disabled = !input.value.trim();
    
    // Handle suggested queries
    messages.addEventListener('click', function(e) {
        const query = e.target.closest('.suggested-query');
        if (query) {
            console.log('=== SUGGESTED QUERY CLICKED ===');
            e.preventDefault();
            const text = query.getAttribute('data-query');
            if (text) {
                input.value = text;
                button.disabled = false;
                try {
                    sendMessage();
                } catch (err) {
                    console.error('Error in sendMessage:', err);
                }
            }
        }
    }, true);
    
    console.log('✓ Chat setup complete!');
    return true;
}

// Try to set up immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded fired');
        setupChat();
    });
} else {
    console.log('DOM already ready, setting up...');
    setupChat();
}

    // Also try after a delay as fallback
    setTimeout(function() {
        const input = document.getElementById('userInput');
        const button = document.getElementById('sendButton');
        if (!input || !button) {
            console.log('Retrying setup after delay...');
            setupChat();
        } else {
            console.log('Elements already found, setup should be complete');
        }
    }, 100);
    
