import React from 'react';
import './App.css'; // Make sure to create and style this CSS file as per your design requirements
import Link from 'next/link'


const MainContent: React.FC = () => {
  return (
    
    /*<div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">*/
      <div className="main-content">
        <header className="header">
          <h1>IELTS Testing</h1>
        </header>
        <div className="skills-section">
          <Link href ='/pick-from-a-list'> 
          <div className="skill">
              <h3>Pick From A List</h3>
              <p> Develop your ability to select correct options from a list in IELTS listening tasks.</p>
          </div>
          </Link>

          <Link href ='/multiple-choice'>
          <div className="skill">
              <h3>Multiple Choice</h3>
              <p>Practice your multiple choice skills with various IELTS listening tests.</p>
          </div>
          </Link>

          <Link href ='/sentence-completion'>
          <div className="skill">
              <h3>Sentence Completion</h3>
              <p>Enhance your ability to complete sentences by listening to IELTS recordings.</p>
          </div>
          </Link>
          
          <Link href='matching'>
          <div className="skill">
            <h3>Matching Information</h3>
            <p>Improve your matching skills with tailored IELTS listening exercises.</p>
          </div>
          </Link>

          <Link href='sort-answer'>
          <div className="skill">
            <h3>Short Answer</h3>
            <p>Hone your short answer skills by practicing with specific IELTS listening questions.</p>
          </div>
          </Link>
        </div>
      </div>
    /*</div>*/
  );
};

export default MainContent;