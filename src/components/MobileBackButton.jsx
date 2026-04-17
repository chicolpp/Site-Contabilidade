import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
      id="premium-mobile-back-btn"
      onClick={handleBack}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '25px', // Colocado na direita para melhor alcance do polegar
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(14, 165, 233, 0.9))', // Cor azul do tema atual facilitando a integração
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        padding: '0',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        WebkitTapHighlightColor: 'transparent'
      }}
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
