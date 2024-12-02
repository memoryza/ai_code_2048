import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface GameItem {
  id: string;
  name: string;
  path: string;
}

const games: GameItem[] = [
  {
    id: '2048',
    name: '2048',
    path: '/2048',
  },
  {
    id: 'tetris',
    name: '俄罗斯方块',
    path: '/tetris',
  },
  {
    id: 'pacman',
    name: '吃豆人',
    path: '/pacman',
  },
  {
    id: 'maze',
    name: '小迷宫',
    path: '/maze',
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto home-container">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Game Hub</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className="group relative block aspect-square bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-75 group-hover:opacity-85 transition-opacity duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{game.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
