// Add these helper functions at the top of the file, before the TypeformQuestions class
const showLoading = () => {
    document.getElementById('loading-spinner').hidden = false;
};

const hideLoading = () => {
    document.getElementById('loading-spinner').hidden = true;
};

const showNotification = (message, type = 'success') => {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
};

class TypeformQuestions {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 3;
        this.answers = {};
        this.init();
    }

    init() {
        // Add the questions HTML
        document.querySelector('.main-content').innerHTML = this.createQuestionsHTML();
        
        // Show first question
        this.showQuestion(1);
        
        // Add event listeners
        this.setupEventListeners();
    }

    createQuestionsHTML() {
        return `
            <div class="question-container">
                <!-- Question 1: Text Input -->
                <div class="question-slide" data-question="1">
                    <h1 class="question">Please state the area that needs immediate attention.</h1>
                    <div class="text-input-container">
                        <input type="text" 
                               id="area" 
                               name="area" 
                               class="text-input" 
                               placeholder="For example - Training Room 1, Executive Conference Room, Site Director's Office, Female Bathroom"
                               required>
                        <button class="continue-btn" data-for="area">Continue</button>
                    </div>
                </div>

                <!-- Question 2: Multiple Choice -->
                <div class="question-slide" data-question="2">
                    <h1 class="question">Please share the type of attention needed.</h1>
                    <div class="options">
                        <input type="radio" id="liquid" name="cleaningType" value="liquid">
                        <label class="radio-option" for="liquid">
                            <div class="radio-label">A</div>
                            <span>Spill Clean Up - Liquid</span>
                        </label>

                        <input type="radio" id="solids" name="cleaningType" value="solids">
                        <label class="radio-option" for="solids">
                            <div class="radio-label">B</div>
                            <span>Spill Clean Up - Solids</span>
                        </label>

                        <input type="radio" id="dusting" name="cleaningType" value="dusting">
                        <label class="radio-option" for="dusting">
                            <div class="radio-label">C</div>
                            <span>Window Sill/Blinds Need Dusting</span>
                        </label>

                        <input type="radio" id="walls" name="cleaningType" value="walls">
                        <label class="radio-option" for="walls">
                            <div class="radio-label">D</div>
                            <span>Baseboards/Walls require spot cleaning</span>
                        </label>

                        <input type="radio" id="trash" name="cleaningType" value="trash">
                        <label class="radio-option" for="trash">
                            <div class="radio-label">E</div>
                            <span>Trash bin/receptacle in need of cleaning/sanitizing</span>
                        </label>

                        <input type="radio" id="restroom" name="cleaningType" value="restroom">
                        <label class="radio-option" for="restroom">
                            <div class="radio-label">F</div>
                            <span>Restroom/amenities in need of cleaning</span>
                        </label>

                        <input type="radio" id="office" name="cleaningType" value="office">
                        <label class="radio-option" for="office">
                            <div class="radio-label">G</div>
                            <span>Office/area in need of general spruce up</span>
                        </label>

                        <input type="radio" id="other" name="cleaningType" value="other">
                        <label class="radio-option" for="other">
                            <div class="radio-label">H</div>
                            <span>Other</span>
                        </label>
                    </div>
                </div>

                <!-- Question 3: Contact Information -->
                <div class="question-slide" data-question="3">
                    <h1 class="question">Please provide your contact information</h1>
                    <div class="text-input-container">
                        <input type="text" 
                               id="contact-name" 
                               name="contactName" 
                               class="text-input" 
                               placeholder="Your full name"
                               required>
                               
                        <input type="tel" 
                               id="contact-phone" 
                               name="contactPhone" 
                               class="text-input" 
                               placeholder="Your phone number"
                               required>
                               
                        <input type="email" 
                               id="contact-email" 
                               name="contactEmail" 
                               class="text-input" 
                               placeholder="Your email address (optional)">
                               
                        <button class="submit-btn" type="submit">Submit</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Handle radio button selections
        document.querySelector('.main-content').addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                this.handleRadioSelection(e);
            }
        });

        // Handle continue button clicks for text inputs
        document.querySelectorAll('.continue-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const inputId = e.target.getAttribute('data-for');
                this.handleTextInputContinue(inputId);
            });
        });

        // Handle submit button
        document.querySelector('.submit-btn').addEventListener('click', (e) => {
            this.handleSubmit(e);
        });

        // Handle text input enter key
        document.querySelectorAll('.text-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (input.id === 'area') {
                        this.handleTextInputContinue(input.id);
                    } else if (this.currentQuestion === 3) {
                        this.handleSubmit(e);
                    }
                }
            });
        });
      
        // Navigation buttons
        document.querySelector('.prev-button').addEventListener('click', () => this.previousQuestion());
        document.querySelector('.next-button').addEventListener('click', () => this.manualNextQuestion());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                this.previousQuestion();
            } else if (e.key === 'ArrowDown') {
                this.manualNextQuestion();
            }
        });

    }

    handleTextInputContinue(inputId) {
        const input = document.getElementById(inputId);
        if (input.value.trim()) {
            this.answers[inputId] = input.value;
            this.nextQuestion();
        } else {
            input.classList.add('error');
            setTimeout(() => input.classList.remove('error'), 1000);
        }
    }

    handleRadioSelection(event) {
        const option = event.target;
        this.answers[option.name] = option.value;
        
        // Add selection animation
        const radioLabel = option.nextElementSibling;
        radioLabel.classList.add('selected');
        
        // Move to next question after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 600);
    }

    async handleSubmit(e) {
        e.preventDefault();
        const nameInput = document.getElementById('contact-name');
        const phoneInput = document.getElementById('contact-phone');
        const emailInput = document.getElementById('contact-email');

        if (nameInput.value.trim() && phoneInput.value.trim()) {
            this.answers.contactName = nameInput.value;
            this.answers.contactPhone = phoneInput.value;
            this.answers.contactEmail = emailInput.value;
            
            // Show loading state
            showLoading();
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/.netlify/functions/sendToGoogleSheets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        timestamp: new Date().toISOString(),
                        area: this.answers.area,
                        cleaningType: this.answers.cleaningType,
                        contactName: this.answers.contactName,
                        contactPhone: this.answers.contactPhone,
                        contactEmail: this.answers.contactEmail || 'Not provided'
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // Show success message
                showNotification('Thank you! Your cleaning request has been submitted.');
                
                // Reset form
                this.resetForm();
            } catch (error) {
                console.error('Error:', error);
                showNotification('Sorry, there was an error submitting your request. Please try again.', 'error');
            } finally {
                // Reset button state
                hideLoading();
                submitBtn.disabled = false;
            }
        } else {
            if (!nameInput.value.trim()) nameInput.classList.add('error');
            if (!phoneInput.value.trim()) phoneInput.classList.add('error');
            
            showNotification('Please fill in all required fields.', 'error');
            
            setTimeout(() => {
                nameInput.classList.remove('error');
                phoneInput.classList.remove('error');
            }, 1000);
        }
    }

    resetForm() {
        this.answers = {};
        this.showQuestion(1);
        document.querySelectorAll('.text-input').forEach(input => input.value = '');
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    }


    showQuestion(number) {
        if (number < 1 || number > this.totalQuestions) return;

        const slides = document.querySelectorAll('.question-slide');
        const currentSlide = document.querySelector('.question-slide.active');
        const nextSlide = document.querySelector(`[data-question="${number}"]`);

        if (currentSlide) {
            currentSlide.classList.add('exit');
            setTimeout(() => {
                currentSlide.classList.remove('active', 'exit');
            }, 600);
        }

        if (nextSlide) {
            setTimeout(() => {
                nextSlide.classList.add('active');
                
                // Focus on text input if present
                const textInput = nextSlide.querySelector('.text-input');
                if (textInput) textInput.focus();
                
                // Animate options if present
                const options = nextSlide.querySelectorAll('.radio-option');
                options.forEach((option, index) => {
                    option.style.opacity = '0';
                    option.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        option.style.opacity = '1';
                        option.style.transform = 'translateY(0)';
                    }, index * 100 + 100);
                });
            }, currentSlide ? 300 : 0);
        }

        this.currentQuestion = number;
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            this.showQuestion(this.currentQuestion + 1);
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
        
    }
    manualNextQuestion() {
        this.nextQuestion();
    }
}

// Additional CSS
const additionalCSS = `
    .text-input-container {
        width: 100%;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .text-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .text-input:focus {
        outline: none;
        border-color: #000;
    }

    .text-input.error {
        border-color: #ff0000;
        animation: shake 0.5s;
    }

    .continue-btn, .submit-btn {
        background-color: #000;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.75rem;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s ease;
    }

    .continue-btn:hover, .submit-btn:hover {
        background-color: #333;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;

const navigationCSS = `
    .navigation {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
    }

    .nav-button {
        background-color: #000;
        color: white;
        border: none;
        border-radius: 4px;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        transition: background-color 0.2s ease, opacity 0.2s ease;
    }

    .nav-button:hover {
        background-color: #333;
    }

    .nav-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add the additional CSS
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
    
    window.typeform = new TypeformQuestions();
});
