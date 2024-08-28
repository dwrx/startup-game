import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import InventoryScreen from './components/InventoryScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import GuideScreen from './components/GuideScreen';
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
                    <Route path="/guide" element={<GuideScreen />} />
                    <Route path="/inventory" element={<InventoryScreen />} />
                    <Route path="/leaderboard" element={<LeaderboardScreen />} />
                </Routes>
            </Router>
        </WalletContextProvider>
    );
};

export default App;
