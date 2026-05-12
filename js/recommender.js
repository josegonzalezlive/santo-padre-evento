/**
 * SantoPadre® Smart Recommender System
 */

const recommenderStyles = `
.recommender-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 10005;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    opacity: 0;
    transition: opacity 0.5s ease;
}

.recommender-card {
    background: #06241a;
    border: 1px solid #ff6b00;
    border-radius: 16px;
    padding: 30px;
    width: 350px;
    max-width: 90vw;
    text-align: center;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    position: relative;
    color: #f4f4f2;
}

.recommender-card h2 {
    color: #ff6b00;
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    margin-bottom: 15px;
}

.recommender-card p {
    font-size: 14px;
    margin-bottom: 25px;
    opacity: 0.9;
}

.recommender-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.option-btn {
    background: #0a3325;
    border: 1px solid #124032;
    padding: 12px;
    border-radius: 8px;
    color: #f4f4f2;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 13px;
    text-transform: uppercase;
}

.option-btn:hover {
    background: #ff6b00;
    color: #000;
    border-color: #ff6b00;
}

.recommendation-result {
    display: none;
    flex-direction: column;
    align-items: center;
}

.recommendation-result img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 15px;
    border: 1px solid rgba(255,107,0,0.3);
}

.add-recommended-btn {
    background: #ff6b00;
    color: #000;
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 8px;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
    margin-top: 15px;
}

.close-recommender {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: #9a9a97;
    font-size: 20px;
    cursor: pointer;
}
`;

class SantoRecommender {
    constructor() {
        this.timer = null;
        this.timeoutDuration = 60000; // 1 minuto
        this.init();
    }

    init() {
        // Inject Styles
        const styleSheet = document.createElement("style");
        styleSheet.innerText = recommenderStyles;
        document.head.appendChild(styleSheet);

        this.startTimer();
        this.watchCart();
    }

    startTimer() {
        if (localStorage.getItem('recommender_shown_today')) return;
        
        this.timer = setTimeout(() => {
            this.showPopup();
        }, this.timeoutDuration);
    }

    stopTimer() {
        if (this.timer) clearTimeout(this.timer);
    }

    watchCart() {
        // Intercept add to cart actions
        const originalAddToCart = window.addToCart;
        if (typeof originalAddToCart === 'function') {
            window.addToCart = (...args) => {
                this.stopTimer();
                return originalAddToCart.apply(null, args);
            };
        }
    }

    showPopup() {
        this.overlay = document.createElement("div");
        this.overlay.className = "recommender-overlay";
        this.overlay.innerHTML = `
            <div class="recommender-card">
                <button class="close-recommender">×</button>
                <div class="survey-step" id="step-1">
                    <h2>¿No sabes qué comer? 🤔</h2>
                    <p>Déjanos ayudarte. ¿Qué tipo de experiencia buscas hoy?</p>
                    <div class="recommender-options">
                        <button class="option-btn" data-type="crunch">Algo Crujiente 💥</button>
                        <button class="option-btn" data-type="classic">Tacos Clásicos 🌮</button>
                        <button class="option-btn" data-type="hungry">¡Tengo mucha hambre! 🏔️</button>
                    </div>
                </div>
                <div class="recommendation-result" id="result-box">
                    <h2 id="rec-title">¡Tu plato ideal!</h2>
                    <img id="rec-img" src="" alt="Recomendación">
                    <p id="rec-desc"></p>
                    <button class="add-recommended-btn">¡Lo quiero!</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);
        
        // Trigger fade in
        setTimeout(() => this.overlay.style.opacity = "1", 10);

        this.initEvents();
    }

    initEvents() {
        this.overlay.querySelector('.close-recommender').onclick = () => this.close();
        
        this.overlay.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = (e) => this.processRecommendation(e.target.dataset.type);
        });
    }

    processRecommendation(type) {
        const step1 = this.overlay.querySelector('#step-1');
        const resultBox = this.overlay.querySelector('#result-box');
        
        let product = null;

        if (type === 'crunch') {
            product = {
                id: 'flauta-cochinita',
                name: 'Flauta de Cochinita (6U)',
                desc: 'Crujiente, jugosa y llena de sabor. Nuestra especialidad para hoy.',
                img: 'https://i.ibb.co/mrnbBWpw/IMG-7618.avif'
            };
        } else if (type === 'classic') {
            product = {
                id: 'tacos-pastor',
                name: 'Tacos al Pastor (3U)',
                desc: 'El rey de la casa. Cerdo marinado y piña asada. Imposible fallar.',
                img: 'https://i.ibb.co/Vc8pztsj/IMG-7083.jpg'
            };
        } else {
            product = {
                id: 'nachos',
                name: 'Nachos Grandes',
                desc: 'Una montaña de sabor para calmar ese apetito voraz.',
                img: 'https://i.ibb.co/1CM7g26/IMG-7103.jpg'
            };
        }

        this.overlay.querySelector('#rec-title').innerText = product.name;
        this.overlay.querySelector('#rec-img').src = product.img;
        this.overlay.querySelector('#rec-desc').innerText = product.desc;

        step1.style.display = 'none';
        resultBox.style.display = 'flex';

        this.overlay.querySelector('.add-recommended-btn').onclick = () => {
            if (typeof addToCart === 'function') {
                addToCart(product.id);
                this.close();
                if (typeof openCart === 'function') openCart();
            }
        };
    }

    close() {
        this.overlay.style.opacity = "0";
        setTimeout(() => {
            this.overlay.remove();
            localStorage.setItem('recommender_shown_today', 'true');
        }, 500);
    }
}

// Start when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new SantoRecommender();
});
