import React from 'react';
import './App.css'; // Make sure to create and style this CSS file as per your design requirements
import Link from 'next/link'


const MainContent: React.FC = () => {
  return (
      <div className="main-content">
        <header className="header">
          <h1>IELTS</h1>
        </header>
        <div className="skills-section">
          <Link href ='/login'> 
          <div className="skill">
              <h3>exam 1</h3>
          </div>
          </Link>

          <Link href ='/login'> 
          <div className="skill">
              <h3>exam 2</h3>
          </div>
          </Link>
          <Link href ='/login'> 
          <div className="skill">
              <h3>exam 3</h3>
          </div>
          </Link>

          <Link href ='/login'> 
          <div className="skill">
              <h3>exam 4</h3>
          </div>
          </Link>
          
          <Link href ='/login'>
          <div className="skill">
              <h3>exam 5</h3>
          </div>
          </Link>

          <Link href ='/login'>
          <div className="skill">
              <h3>exam 6</h3>
          </div>
          </Link>
          
          <Link href='login'>
          <div className="skill">
            <h3>exam 7</h3>
          </div>
          </Link>

          <Link href='login'>
          <div className="skill">
            <h3>exam 8</h3>
          </div>
          </Link>
        </div>
      </div>
  );
};

export default MainContent;