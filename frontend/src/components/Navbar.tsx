import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import useProgram from '../hooks/useProgram';
import '../styles.css';

const Navbar: React.FC = () => {
    const wallet = useWallet();
    const program = useProgram();
    const [balances, setBalances] = useState({
        cleanCash: 0,
        dirtyCash: 0,
        enforcers: 0,
        hitmen: 0,
    });

    useEffect(() => {
        const fetchBalances = async () => {
            if (!wallet.connected || !wallet.publicKey || !program) return;

            const [playerPda] = await PublicKey.findProgramAddress(
                [Buffer.from('PLAYER'), wallet.publicKey.toBuffer()],
                program.programId
            );

            try {
                // @ts-ignore
                const playerAccount = await program.account.player.fetch(playerPda);
                setBalances({
                    cleanCash: playerAccount.cleanCash.toNumber(),
                    dirtyCash: playerAccount.dirtyCash.toNumber(),
                    enforcers: playerAccount.enforcers.toNumber(),
                    hitmen: playerAccount.hitmen.toNumber(),
                });
            } catch (err) {
                console.error('Failed to fetch balances', err);
            }
        };

        fetchBalances();
    }, [wallet.connected, wallet.publicKey, program]);

    return (
        <div className="navbar">
            <div className="navbar-left">
                <div>Clean Cash: ${balances.cleanCash}</div>
                <div>Dirty Cash: ${balances.dirtyCash}</div>
                <div>Enforcers: {balances.enforcers}</div>
                <div>Hitmen: {balances.hitmen}</div>
            </div>
            <div className="navbar-right">
                <WalletMultiButton />
            </div>
        </div>
    );
};

export default Navbar;
