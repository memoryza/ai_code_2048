import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScoreRecord } from '../types/game';

const HistoryPage = () => {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    const sortedScores = savedScores.sort((a: ScoreRecord, b: ScoreRecord) => b.score - a.score);
    setScores(sortedScores);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Score History</h1>
        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Game
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {scores.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No scores yet. Play a game to set some records!
          </div>
        ) : (
          <div className="block sm:hidden">
            {scores.map((record, index) => (
              <div 
                key={index}
                className={`p-4 border-b ${index < 3 ? 'bg-yellow-50' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">#{index + 1}</span>
                  <span className="text-xl font-bold text-blue-600">{record.score}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{record.playerName}</span>
                  <span>{record.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {scores.length > 0 && (
          <table className="hidden sm:table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scores.map((record, index) => (
                <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.playerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryPage; 