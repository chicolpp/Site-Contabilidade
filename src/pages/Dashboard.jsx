import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { 
  deliveryBase64 as lancamentoImg, 
  portariaBase64 as relatorioImg, 
  ocorrenciaBase64 as folhaImg, 
  espacosBase64 as tributosImg,
  chavesBase64 as docImg
} from "../assets/icon-base64.js";

export default function Dashboard() {
  const navigate = useNavigate();

  const ActionCard = ({ image, label, onClick }) => (
    <button className="action-card" onClick={onClick}>
      <img src={image} alt={label} />
      {label}
    </button>
  );

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const cargo = user?.cargo?.toLowerCase() || "";
  const isAdmin = user?.is_admin || true;

  const FileTextIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
  
  const ChartIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  
  const DollarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

  const UsersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

  const ScalesIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12A10 10 0 0 0 12 2A10 10 0 0 0 22 12"/><path d="M12 2v20"/><line x1="12" y1="22" x2="18" y2="22"/><line x1="6" y1="22" x2="12" y2="22"/><path d="M22 12l-4-4-4 4"/></svg>;  const clienteActions = [
    {
      image: docImg,
      label: "Documentos",
      onClick: () => navigate("/documentos")
    }
  ];

  const canSeeDashboard = cargo === "cliente" || isAdmin;

  return (
    <div className="dashboard-container">
      <h1>Painel de Controle</h1>
      <p>Bem-vindo ao Sistema de Contabilidade</p>

      {canSeeDashboard ? (
        <div className="dashboard-section">
          <h2 className="section-title">Central do Cliente</h2>
          <div className="dashboard-grid single-item-grid">
            {clienteActions.map((action, index) => (
              <ActionCard
                key={index}
                image={action.image}
                label={action.label}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-empty-state">
          <p>Você não possui acesso aos módulos operacionais do Dashboard no momento.</p>
        </div>
      )}
    </div>
  );
}
