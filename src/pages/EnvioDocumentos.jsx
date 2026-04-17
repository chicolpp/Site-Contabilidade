import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import './EnvioDocumentos.css';

// Ícones
const UploadIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function EnvioDocumentos() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [showClientesDropdown, setShowClientesDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const initialFormState = {
        cliente_id: "",
        cliente_nome: "",
        setor: "Fiscal",
        tipo_documento: "",
        competencia: "",
        titulo: "",
        descricao: "",
        arquivo: "",
        extensao: ""
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await api.get('/usuarios/clientes');
                setClientes(response.data.clientes || []);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            }
        };
        fetchClientes();
    }, []);

    // Clique fora do dropdown de clientes
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowClientesDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "cliente_nome") {
            const filtered = clientes.filter(c => {
                const nomeCompleto = `${c.nome} ${c.sobrenome}`.toLowerCase();
                const fantazia = (c.nome_fantasia || "").toLowerCase();
                return nomeCompleto.includes(value.toLowerCase()) || fantazia.includes(value.toLowerCase());
            });
            setFilteredClientes(filtered);
            setShowClientesDropdown(true);
        }
    };

    const selectCliente = (cliente) => {
        setFormData(prev => ({
            ...prev,
            cliente_id: cliente.id,
            cliente_nome: cliente.nome_fantasia ? `${cliente.nome_fantasia} (${cliente.nome})` : `${cliente.nome} ${cliente.sobrenome}`
        }));
        setShowClientesDropdown(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    arquivo: reader.result,
                    extensao: file.name.split('.').pop().toLowerCase()
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.cliente_id) return toast.error("Selecione um cliente válido.");
        if (!formData.competencia) return toast.error("A competência é obrigatória.");
        if (!formData.arquivo) return toast.error("O arquivo é obrigatório.");

        setLoading(true);
        try {
            await api.post('/documentos', formData);
            toast.success("Documento enviado com sucesso!");
            setFormData(initialFormState); // Limpa o formulário como solicitado
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao enviar documento");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="envio-docs-container">
            <div className="envio-docs-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>← Voltar</button>
                <h1>Envio de Documentos</h1>
            </div>

            <form className="envio-docs-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h2 className="section-title">Informações do Cliente e Setor</h2>
                    
                    <div className="form-group autocomplete-group" ref={dropdownRef}>
                        <label>Cliente</label>
                        <div className="input-with-icon">
                            <UserIcon />
                            <input
                                type="text"
                                name="cliente_nome"
                                value={formData.cliente_nome}
                                onChange={handleChange}
                                placeholder="Digite o nome do cliente..."
                                autoComplete="off"
                                required
                            />
                        </div>
                        {showClientesDropdown && filteredClientes.length > 0 && (
                            <ul className="autocomplete-dropdown">
                                {filteredClientes.map(c => (
                                    <li key={c.id} onClick={() => selectCliente(c)}>
                                        <strong>{c.nome_fantasia || `${c.nome} ${c.sobrenome}`}</strong>
                                        {c.nome_fantasia && <small>({c.nome} {c.sobrenome})</small>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Setor</label>
                            <select name="setor" value={formData.setor} onChange={handleChange}>
                                <option value="Fiscal">Fiscal</option>
                                <option value="Pessoal">Pessoal</option>
                                <option value="Contábil">Contábil</option>
                                <option value="Jurídico">Jurídico</option>
                                <option value="Financeiro">Financeiro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Documento</label>
                            <input
                                type="text"
                                name="tipo_documento"
                                value={formData.tipo_documento}
                                onChange={handleChange}
                                placeholder="Ex: Nota Fiscal, Contrato..."
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Competência (Mês/Ano)</label>
                        <input
                            type="month"
                            name="competencia"
                            value={formData.competencia}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2 className="section-title">Detalhes para o Cliente</h2>
                    
                    <div className="form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Título que aparecerá para o cliente"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                            name="descricao"
                            className="descricao-textarea"
                            value={formData.descricao}
                            onChange={handleChange}
                            placeholder="Breve descrição do documento..."
                            rows={4}
                        />
                        <span className="char-counter">{formData.descricao.length}/500</span>
                    </div>

                    <div className="form-group file-upload-group">
                        <label>Arquivo (PDF, Imagem ou DOCX)</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                accept=".pdf, .png, .jpg, .jpeg, .docx"
                                onChange={handleFileChange}
                                id="fileInput"
                            />
                            <label htmlFor="fileInput" className="file-label">
                                <UploadIcon />
                                <span>{formData.arquivo ? "Arquivo selecionado ✓" : "Selecionar Arquivo"}</span>
                            </label>
                            {formData.extensao && <span className="file-ext">Tipo: {formData.extensao.toUpperCase()}</span>}
                        </div>
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Enviando..." : (
                        <>
                            <CheckIcon />
                            Finalizar Envio
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
