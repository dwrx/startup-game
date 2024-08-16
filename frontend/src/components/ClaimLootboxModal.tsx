import React, { useState } from "react";
import { Modal, Button, CircularProgress } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import "./ClaimLootboxModal.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

interface ClaimLootboxModalProps {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  twitterLinked: boolean;
  followedOnTwitter: boolean;
  xp: number;
  linkTwitter: () => void;
  followOnTwitter: () => void;
  onSignInSuccess: () => void;
  onClaim: () => void;
}

const ClaimLootboxModal: React.FC<ClaimLootboxModalProps> = ({
  open,
  onClose,
  signedIn,
  twitterLinked,
  followedOnTwitter,
  xp,
  linkTwitter,
  followOnTwitter,
  onSignInSuccess,
  onClaim,
}) => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!wallet || !wallet.signMessage || !wallet.publicKey) {
      setError("Wallet is not connected or does not support message signing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const message = "Login to Startup game";
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await wallet.signMessage(encodedMessage);

      const response = await fetch(`${API_BASE_URL}/api/v1/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          publicKey: wallet.publicKey.toBase58(),
          signature: btoa(String.fromCharCode(...signature)),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to authorize");
      }

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("JWT", data.token);
        onSignInSuccess();
        setError(null);
        if (data.x_linked) {
          linkTwitter();
        }
      } else {
        setError("Authorization failed.");
      }
    } catch (err) {
      setError("Sign in failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="claim-lootbox-modal-title"
      aria-describedby="claim-lootbox-modal-description"
      className="claim-modal"
    >
      <div className="modal-content">
        <h2 id="claim-lootbox-modal-title">Claim Lootbox</h2>
        <p>Lootboxes open up to NFTs, gems, and other rewards after pre-season concludes.</p>
        {error && <p className="error-message">{error}</p>}
        <ul className="claim-checklist">
          <li>
            <span>Verify wallet</span>
            <div className={`${signedIn ? "status completed" : "not-completed"}`}>
              {signedIn ? (
                <div className="checkmark">&#10004;</div>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSignIn}
                  style={{ backgroundColor: "#ffcc00", color: "#000" }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Sign in"}
                </Button>
              )}
            </div>
          </li>
          <li>
            <span>Link X (Twitter) account</span>
            <div className={`status ${twitterLinked ? "completed" : "not-completed"}`}>
              {twitterLinked && signedIn ? (
                <div className="checkmark">&#10004;</div>
              ) : signedIn ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    (window.location.href = `${API_BASE_URL}/api/v1/auth/twitter?token=${localStorage.getItem("JWT")}`)
                  }
                  style={{ marginRight: "20px", backgroundColor: "#ffcc00", color: "#000" }}
                >
                  Link
                </Button>
              ) : (
                <div className="xmark">&#10008;</div>
              )}
            </div>
          </li>
          <li>
            <span>Follow Startup on X</span>
            <div className={`status ${followedOnTwitter ? "completed" : "not-completed"}`}>
              {twitterLinked && followedOnTwitter && signedIn ? (
                <div className="checkmark">&#10004;</div>
              ) : signedIn && twitterLinked ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    window.open("https://twitter.com/intent/follow?screen_name=playstartupio", "_blank");
                    followOnTwitter();
                  }}
                  style={{ marginRight: "20px", backgroundColor: "#ffcc00", color: "#000" }}
                >
                  Follow
                </Button>
              ) : (
                <div className="xmark">&#10008;</div>
              )}
            </div>
          </li>
          <li>
            <span>Get 3 XP in the game</span>
            <div className={`status ${xp >= 3 && signedIn ? "completed" : "not-completed"}`}>
              {xp >= 3 && signedIn ? <div className="checkmark">&#10004;</div> : <div className="xmark">&#10008;</div>}
            </div>
          </li>
          {signedIn && twitterLinked && followedOnTwitter && xp >= 3 && (
            <Button
              variant="contained"
              color="primary"
              onClick={onClaim}
              style={{ marginTop: "20px", backgroundColor: "#ffcc00", color: "#000", width: "100%" }}
            >
              Claim Lootbox
            </Button>
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default ClaimLootboxModal;
