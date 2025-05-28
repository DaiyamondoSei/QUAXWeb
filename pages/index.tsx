import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="home-container">
      <h1>QUANNEX</h1>
      <h2>Quantum Nexus: Download Information from Your Dream Future</h2>
      <p>Your AI Guide to Expanded Consciousness & Future Self Integration</p>
      
      <div className="cta-buttons">
        <a 
          href="https://www.kickstarter.com/projects/88268222/quantum-nexus-download-your-dream-future" 
          className="cta-button primary" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => {
            // Allow the default link behavior
            e.stopPropagation();
          }}
        >
          SUPPORT ON KICKSTARTER
        </a>
        <a href="#" className="cta-button secondary">LEARN MORE</a>
      </div>
    </div>
  );
};

export default Home; 