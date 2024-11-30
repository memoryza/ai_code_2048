import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game2048 from './games/2048';
import History2048 from './games/2048/history';
import Tetris from './games/tetris';
import TetrisHistory from './games/tetris/history';
import Pacman from './games/pacman';
import PacmanHistory from './games/pacman/history';
import MazeGame from './games/maze';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;