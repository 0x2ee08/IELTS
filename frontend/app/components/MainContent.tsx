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
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 1</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>

          <Link href ='/login'> 
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 2</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>
          <Link href ='/login'> 
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 3</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>

          <Link href ='/login'> 
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 4</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>
          
          <Link href ='/login'>
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 5</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>

          <Link href ='/login'>
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 6</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>
          
          <Link href='login'>
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 7</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>

          <Link href='login'>
          <div className="skill">
          <div className="skill-card">
                <h3>IELTS Simulation Listening test 8</h3>
                <div className="details">
                  <span>⏰ 40 phút | 👥 148098 | 💬 288</span>
                  <span>4 phần thi | 40 câu hỏi</span>
                </div>
                <div className="tags">
                  <span className="tag">#IELTS Academic</span>
                  <span className="tag">#Listening</span>
                </div>
              </div>
          </div>
          </Link>
        </div>
      </div>
  );
};

export default MainContent;