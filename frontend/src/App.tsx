import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import WalletContextProvider from './context/WalletContext';
import './styles.css';

const App: React.FC = () => {
    return (
        <WalletContextProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/game" element={<GameScreen />} />
                </Routes>
            </Router>
        </WalletContextProvider>
    );
};

export default App;
