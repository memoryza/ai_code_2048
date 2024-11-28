import { 
  createRoutesFromElements,
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Route
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';

const router = createHashRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<HomePage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true
    }
  }
);

function App() {
  return (
    <RouterProvider 
      router={router} 
      future={{
        v7_startTransition: true
      }}
    />
  );
}

export default App;
