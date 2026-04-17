import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MobileBackButton.css";

export default function MobileBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    navigate("/dashboard");
  };

  // Lógica de visibilidade final
  const cleanPath = location.pathname.replace(/\/$/, "");
  const shouldHide = ['/dashboard', '/login', ''].includes(cleanPath);

  if (!isMobile || shouldHide) return null;
  
  return (
    <button
      className="premium-mobile-back-btn"
      onClick={handleBack}
      aria-label="Voltar"
    >
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
