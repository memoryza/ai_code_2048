import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHistory } from './types';

const PacmanHistory: React.FC = () => {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedHistory = localStorage.getItem('pacmanHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  return (
    <div className="min-h-screen bg-black py-8 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pacman History</h1>
          <button
            onClick={() => navigate('/pacman')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Back to Game
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {history.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PacmanHistory;
