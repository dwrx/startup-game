import React from "react";
import { Tooltip } from "@mui/material";

interface BalancesProps {
  cleanCash: number;
  dirtyCash: number;
  silver: number;
  xp: number;
  enforcers: number;
  hitmen: number;
}

const Balances: React.FC<BalancesProps> = ({
  cleanCash,
  dirtyCash,
  silver,
  xp,
  enforcers,
  hitmen,
}) => {
  return (
    <div className="navbar-left">
      <Tooltip title="Clean cash">
        <div className="text-center balance-item">
          <img src="/clean-money.png" width="32" alt="Clean Cash:" /> ${cleanCash}
        </div>
      </Tooltip>
      <Tooltip title="Dirty cash">
        <div className="text-center balance-item">
          <img src="/dirty-money.png" width="32" alt="Dirty Cash:" /> ${dirtyCash}
        </div>
      </Tooltip>
      <Tooltip title="Enforcers are defensive guards that patrol the rooms.">
        <div className="text-center balance-item">
          <img src="/enforcer.png" width="32" alt="Enforcers:" /> {enforcers}
        </div>
      </Tooltip>
      <Tooltip title="Hitmen are good at attacking competitors.">
        <div className="text-center balance-item">
          <img src="/hitman.png" width="32" alt="Hitmen:" /> {hitmen}
        </div>
      </Tooltip>
      <div className="desktop-only">|</div>
      <Tooltip title="Silver is used to purchase and upgrade loot boxes.">
        <div className="text-center balance-item">
          <img src="/silver.png" width="32" alt="Silver:" /> {silver}
        </div>
      </Tooltip>
      <Tooltip title="Experience">
        <div className="text-center balance-item">
          <b>{xp} XP</b>
        </div>
      </Tooltip>
    </div>
  );
};

export default Balances;
