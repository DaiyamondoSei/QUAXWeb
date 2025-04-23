// Progress Visualization Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Demo data - in production, this would come from the backend
    const userData = {
        meditationSessions: 0,
        achievements: 0,
        consciousnessLevel: 1.0,
        stageProgress: {
            initiation: 0,
            quantumAwareness: 0,
            consciousnessExpansion: 0,
            quantumMastery: 0
        }
    };

    // Initialize progress bars
    function initializeProgress() {
        // Update stage progress bars
        Object.entries(userData.stageProgress).forEach(([stage, progress]) => {
            const progressBar = document.querySelector(`.progress-stage:nth-child(${getStageIndex(stage)}) .progress-fill`);
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
        });

        // Update stats
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = userData.meditationSessions;
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = userData.achievements;
        document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = userData.consciousnessLevel.toFixed(1);
    }

    // Helper function to get stage index
    function getStageIndex(stage) {
        const stages = ['initiation', 'quantumAwareness', 'consciousnessExpansion', 'quantumMastery'];
        return stages.indexOf(stage) + 1;
    }

    // Animate progress increase
    function animateProgress(element, start, end, duration = 1000) {
        const startTimestamp = performance.now();
        
        function update(currentTimestamp) {
            const elapsed = currentTimestamp - startTimestamp;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * progress;
            element.style.width = `${current}%`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // Demo function to simulate progress
    function simulateProgress() {
        const stages = Object.keys(userData.stageProgress);
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        const currentProgress = userData.stageProgress[randomStage];
        const newProgress = Math.min(currentProgress + Math.random() * 20, 100);
        
        userData.stageProgress[randomStage] = newProgress;
        
        const progressBar = document.querySelector(`.progress-stage:nth-child(${getStageIndex(randomStage)}) .progress-fill`);
        if (progressBar) {
            animateProgress(progressBar, currentProgress, newProgress);
        }

        // Update stats
        userData.meditationSessions++;
        if (Math.random() > 0.7) userData.achievements++;
        userData.consciousnessLevel = Math.min(userData.consciousnessLevel + 0.1, 10.0);

        // Update stats display with animation
        updateStatsWithAnimation();
    }

    // Animate stats updates
    function updateStatsWithAnimation() {
        const stats = document.querySelectorAll('.stat-value');
        
        stats[0].textContent = userData.meditationSessions;
        stats[1].textContent = userData.achievements;
        stats[2].textContent = userData.consciousnessLevel.toFixed(1);

        stats.forEach(stat => {
            stat.style.animation = 'none';
            stat.offsetHeight; // Trigger reflow
            stat.style.animation = 'statUpdate 0.5s ease-out';
        });
    }

    // Add hover effects
    function addHoverEffects() {
        const stages = document.querySelectorAll('.progress-stage');
        stages.forEach(stage => {
            stage.addEventListener('mouseenter', () => {
                stage.style.transform = 'translateY(-5px)';
                const icon = stage.querySelector('.stage-icon');
                icon.style.transform = 'scale(1.1)';
            });
            
            stage.addEventListener('mouseleave', () => {
                stage.style.transform = 'translateY(0)';
                const icon = stage.querySelector('.stage-icon');
                icon.style.transform = 'scale(1)';
            });
        });
    }

    // Initialize everything
    initializeProgress();
    addHoverEffects();

    // For demo purposes: simulate progress every few seconds
    setInterval(simulateProgress, 5000);
}); 