class QuantumVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isAnimating = true;
        this.lastTime = 0;
        this.quantumState = {
            consciousness: 0.5,
            awareness: 0.3,
            coherence: 0.4,
            entanglement: 0.2
        };

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize particles
        this.createParticles(50);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    createParticles(count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                color: this.getQuantumColor(),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    getQuantumColor() {
        const colors = [
            'rgba(110, 0, 255, 0.6)',
            'rgba(0, 184, 255, 0.6)',
            'rgba(255, 0, 230, 0.6)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('resetVisualization').addEventListener('click', () => this.reset());
        document.getElementById('toggleAnimation').addEventListener('click', (e) => {
            this.isAnimating = !this.isAnimating;
            e.target.textContent = this.isAnimating ? 'Pause' : 'Play';
            if (this.isAnimating) this.animate();
        });
        document.getElementById('exportData').addEventListener('click', () => this.exportData());

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update quantum state based on mouse position
        this.quantumState.consciousness = x / this.canvas.width;
        this.quantumState.awareness = y / this.canvas.height;
        this.quantumState.coherence = (x + y) / (this.canvas.width + this.canvas.height);
        this.quantumState.entanglement = Math.abs(x - y) / Math.max(this.canvas.width, this.canvas.height);
    }

    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX * deltaTime * 0.016;
            particle.y += particle.speedY * deltaTime * 0.016;

            // Update phase
            particle.phase += 0.01 * deltaTime * 0.016;

            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;

            // Quantum state influence
            const influence = Math.sin(particle.phase) * this.quantumState.coherence;
            particle.speedX += influence * 0.1;
            particle.speedY += influence * 0.1;

            // Speed limit
            const maxSpeed = 3;
            const speed = Math.sqrt(particle.speedX ** 2 + particle.speedY ** 2);
            if (speed > maxSpeed) {
                particle.speedX = (particle.speedX / speed) * maxSpeed;
                particle.speedY = (particle.speedY / speed) * maxSpeed;
            }
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw quantum field
        this.drawQuantumField();

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Draw connections
            this.drawParticleConnections(particle);
        });
    }

    drawQuantumField() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) / 2
        );

        gradient.addColorStop(0, `rgba(110, 0, 255, ${0.1 * this.quantumState.consciousness})`);
        gradient.addColorStop(0.5, `rgba(0, 184, 255, ${0.1 * this.quantumState.awareness})`);
        gradient.addColorStop(1, `rgba(255, 0, 230, ${0.1 * this.quantumState.coherence})`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawParticleConnections(particle) {
        const connectionDistance = 100;
        const connectionOpacity = 0.2 * this.quantumState.entanglement;

        this.particles.forEach(otherParticle => {
            if (particle === otherParticle) return;

            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(otherParticle.x, otherParticle.y);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${connectionOpacity * (1 - distance / connectionDistance)})`;
                this.ctx.stroke();
            }
        });
    }

    animate(currentTime = 0) {
        if (!this.isAnimating) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.updateParticles(deltaTime);
        this.drawParticles();

        requestAnimationFrame((time) => this.animate(time));
    }

    reset() {
        this.particles = [];
        this.createParticles(50);
        this.quantumState = {
            consciousness: 0.5,
            awareness: 0.3,
            coherence: 0.4,
            entanglement: 0.2
        };
    }

    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            quantumState: this.quantumState,
            particleCount: this.particles.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quantum-state-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize visualization when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualization = new QuantumVisualization('quantumCanvas');
}); 