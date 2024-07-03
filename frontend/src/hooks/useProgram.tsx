import { useMemo } from 'react';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '../idl.json';

const useProgram = () => {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const program = useMemo(() => {
        if (!wallet) {
            return null;
        }
        const provider = new AnchorProvider(connection, wallet, { preflightCommitment: 'processed' });
        return new Program(idl as Idl, provider);
    }, [wallet, connection]);

    return program;
};

export default useProgram;
