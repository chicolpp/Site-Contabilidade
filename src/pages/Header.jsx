import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getUser } from "../services/auth";
import { getUploadUrl } from "../services/api";
import { 
  defaultAvatarBase64 as defaultAvatar 
} from "../assets/icon-base64.js";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const user = getUser();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      let maxScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const elements = document.querySelectorAll('*');
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].scrollTop > maxScroll) {
          maxScroll = elements[i].scrollTop;
        }
      }
      if (maxScroll > 50) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    const interval = setInterval(checkScroll, 200);
    window.addEventListener("scroll", checkScroll, { passive: true, capture: true });
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", checkScroll, { capture: true });
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const elements = document.querySelectorAll('*');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].scrollTop > 0) {
        elements[i].scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cargo = user?.cargo?.toLowerCase() || "";
  const isAdmin = user?.is_admin || true;

  const contadorLinks = [
    { path: "/lancamentos", label: "Lançamentos Contábeis" },
    { path: "/relatorios", label: "Relatórios Fiscais" },
    { path: "/folha", label: "Folha de Pagamento" },
    { path: "/tributos", label: "Tributos" },
    { path: "/envio-documentos", label: "Envio de Documentos" }
  ];

  const clienteLinks = [
    { path: "/notas", label: "Notas Fiscais" },
    { path: "/guias", label: "Guias de Imposto" },
    { path: "/documentos", label: "Documentos" },
    { path: "/atendimento", label: "Atendimento" }
  ];

  const quickLinks = [
    ...(cargo === "contador" || isAdmin ? contadorLinks : []),
    ...(cargo === "cliente" || isAdmin ? clienteLinks : [])
  ].filter((link, index, self) => 
    index === self.findIndex((t) => t.path === link.path)
  ).filter(link => {
    // Se for Cliente ou Admin, mostramos apenas os dois links específicos pedidos
    if (cargo === "cliente" || isAdmin) {
      return ["Documentos", "Envio de Documentos"].includes(link.label);
    }
    return true;
  });

  // Áreas pesquisáveis do sistema
  const allSearchableAreas = [
    ...contadorLinks,
    ...clienteLinks,
    { path: "/cadastro-usuarios", label: "Cadastro de Usuários", adminOnly: true },
    { path: "/monitoramento", label: "Monitoramento", adminOnly: true },
  ].filter((area, index, self) => 
    index === self.findIndex((t) => t.path === area.path)
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      const filtered = allSearchableAreas.filter(area => {
        if (area.adminOnly && !isAdmin) return false;
        
        // Check se pertence a contador ou cliente
        const isContadorArea = contadorLinks.some(link => link.path === area.path);
        const isClienteArea = clienteLinks.some(link => link.path === area.path);

        if (isAdmin) return true;
        if (cargo === "contador" && isContadorArea) return true;
        if (cargo === "cliente" && isClienteArea) return true;
        
        return false;
      }).filter(area => {
        if (cargo === "cliente" || isAdmin) {
           return ["Documentos", "Envio de Documentos"].includes(area.label);
        }
        return true;
      }).filter(area => area.label.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (suggestions.length > 0) {
      navigate(suggestions[0].path);
      setSearchTerm("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (path) => {
    navigate(path);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setSearchTerm("");
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSuggestions([]);
    }, 200);
  };

  return (
    <header>
      {/* Sidebar esquerda */}
      <div className="header-sidebar">
        {/* Logo e nome do sistema */}
        <div className="header-brand">
          <Link to="/dashboard" className="header-system-name" style={{ textDecoration: 'none' }}>
            Contabilidade
          </Link>

          {/* Perfil mobile */}
          <div className="mobile-user-profile">
            <span>{user?.nome || "Usuário"}</span>
            {user?.foto ? (
              <img
                src={getUploadUrl(user.foto)}
                alt="Avatar"
                onError={(e) => { e.target.src = defaultAvatar; }}
              />
            ) : (
              <img src={defaultAvatar} alt="Avatar" className="mobile-avatar-placeholder" />
            )}
          </div>
        </div>

        {/* Pesquisa */}
        <div className="header-search">
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          <button onClick={handleSearchSubmit}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Sugestões de busca */}
          {suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((s) => (
                <li key={s.path} onClick={() => handleSuggestionClick(s.path)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Links rápidos */}
        <nav className="header-quick-links">
          {quickLinks.map((link) => (
            <Link key={link.path} to={link.path} className="quick-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Área direita - Perfil */}
      <div className="header-right">
        <div className="user-profile">
          {user?.foto ? (
            <img
              src={getUploadUrl(user.foto)}
              alt="Avatar"
              onError={(e) => { e.target.src = defaultAvatar; }}
            />
          ) : (
            <img src={defaultAvatar} alt="Avatar" className="user-avatar-placeholder" />
          )}
          <span>{user?.nome || "Usuário"}</span>
        </div>

        <div className="dropdown">
          <button>Menu ▾</button>
          <ul className="dropdown-menu">
            {isAdmin && (
              <>
                <li>
                  <Link to="/cadastro-usuarios">Cadastro de Usuários</Link>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout}>Sair</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Botão hamburger mobile */}
      <button
        className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* NOVO BTN SCROLL TO TOP */}
      {showScroll && (
        <button 
          onClick={scrollToTop} 
          className="header-scroll-top-btn"
          aria-label="Voltar ao topo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      )}

      {/* Menu mobile dropdown */}
      <div className={`mobile-dropdown ${mobileMenuOpen ? 'open' : ''}`}>
        {isAdmin && (
          <>
            <Link to="/cadastro-usuarios" onClick={() => setMobileMenuOpen(false)}>
              Cadastro de Usuários
            </Link>
          </>
        )}
        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
          Sair
        </button>
      </div>
    </header>
  );
}
