import React from 'react';

interface UserInfo {
  username: string;
  score: number[];
}

interface RankingPageProps {
  questions: string[];
  users: UserInfo[];
}

const RankingPage: React.FC<RankingPageProps> = ({ questions, users }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold my-4">Rankings</h2>
      <table className="w-full text-left border-collapse border">
        <thead>
          <tr>
            <th className="border px-4 py-2">User</th>
            {questions.map((question, index) => (
              <th key={index} className="border px-4 py-2">{question}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{user.username}</td>
              {user.score.map((score, i) => (
                <td key={i} className="border px-4 py-2">{score}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingPage;
