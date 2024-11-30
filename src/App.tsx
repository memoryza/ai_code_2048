import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense } from 'react';
import './App.css';

// 懒加载组件
const Home = React.lazy(() => import('./pages/Home'));
const Game2048 = React.lazy(() => import('./games/2048'));
const History2048 = React.lazy(() => import('./games/2048/history'));
const Tetris = React.lazy(() => import('./games/tetris'));
const TetrisHistory = React.lazy(() => import('./games/tetris/history'));
const Pacman = React.lazy(() => import('./games/pacman'));
const PacmanHistory = React.lazy(() => import('./games/pacman/history'));
const MazeGame = React.lazy(() => import('./games/maze'));

// 加载状态组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/2048" element={<Game2048 />} />
          <Route path="/2048/history" element={<History2048 />} />
          <Route path="/tetris" element={<Tetris />} />
          <Route path="/tetris/history" element={<TetrisHistory />} />
          <Route path="/maze" element={<MazeGame />} />
          <Route path="/pacman" element={<Pacman />} />
          <Route path="/pacman/history" element={<PacmanHistory />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;