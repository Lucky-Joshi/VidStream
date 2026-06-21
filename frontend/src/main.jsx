import process from 'process';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

globalThis.process = process;

createRoot(document.getElementById('root')).render(<App />);
