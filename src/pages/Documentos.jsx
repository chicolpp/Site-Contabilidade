import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import './Documentos.css';

// Ícones
const FileIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const ViewIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const DownloadIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const SearchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

export default function Documentos() {
    const [documentos, setDocumentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Dados do usuário logado
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user?.is_admin || false;
    const clienteId = user?.id;

    useEffect(() => {
        fetchDocumentos();
    }, []);

    const fetchDocumentos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/documentos', {
                params: {
                    cliente_id: clienteId,
                    is_admin: isAdmin
                }
            });
            setDocumentos(response.data.documentos || []);
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    // Filtro de pesquisa
    const documentosFiltrados = useMemo(() => {
        return documentos.filter(doc => 
            doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tipo_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (isAdmin && doc.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [documentos, searchTerm, isAdmin]);

    // Paginação
    const totalPages = Math.ceil(documentosFiltrados.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDocs = documentosFiltrados.slice(startIndex, startIndex + itemsPerPage);

    // Função para abrir o arquivo (Blob URL)
    const handleView = (doc) => {
        try {
            // Se for Base64 puro (com prefixo data:), extraímos o conteúdo
            const base64Content = doc.arquivo.split(',')[1] || doc.arquivo;
            const mimeType = doc.arquivo.split(',')[0].split(':')[1]?.split(';')[0] || getMimeType(doc.extensao);
            
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error('Erro ao visualizar arquivo:', error);
            toast.error('Erro ao abrir o arquivo');
        }
    };

    // Função para download
    const handleDownload = (doc) => {
        try {
            const base64Content = doc.arquivo.split(',')[1] || doc.arquivo;
            const mimeType = doc.arquivo.split(',')[0].split(':')[1]?.split(';')[0] || getMimeType(doc.extensao);
            
            const link = document.createElement('a');
            link.href = doc.arquivo.startsWith('data:') ? doc.arquivo : `data:${mimeType};base64,${base64Content}`;
            link.download = `${doc.titulo}.${doc.extensao}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            toast.error('Erro ao baixar o arquivo');
        }
    };

    const getMimeType = (ext) => {
        const mimes = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword'
        };
        return mimes[ext.toLowerCase()] || 'application/octet-stream';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    return (
        <div className="documentos-container">
            <div className="documentos-header">
                <h2><FileIcon /> Documentos</h2>
                <div className="header-search" style={{ width: '300px' }}>
                    <input 
                        type="text" 
                        placeholder="Pesquisar documentos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="button"><SearchIcon /></button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando documentos...</div>
            ) : documentosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Nenhum documento encontrado.
                </div>
            ) : (
                <div className="responsive-table-container">
                    {/* Desktop Table */}
                    <table className="documentos-table desktop-only-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                {isAdmin && <th>Cliente</th>}
                                <th>Setor</th>
                                <th>Título / Tipo</th>
                                <th>Competência</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentDocs.map(doc => (
                                <tr key={doc.id}>
                                    <td>#{doc.id}</td>
                                    {isAdmin && <td>{doc.cliente_nome || '—'}</td>}
                                    <td>
                                        <span className="status-badge setor-badge">{doc.setor}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{doc.titulo}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{doc.tipo_documento}</div>
                                    </td>
                                    <td>{doc.competencia}</td>
                                    <td>{formatDate(doc.data_upload)}</td>
                                    <td className="actions-cell">
                                        <button className="action-btn view-btn" onClick={() => handleView(doc)}>
                                            <ViewIcon /> Ver
                                        </button>
                                        <button className="action-btn download-btn" onClick={() => handleDownload(doc)}>
                                            <DownloadIcon /> Baixar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Cards */}
                    <div className="mobile-cards-container">
                        {currentDocs.map(doc => (
                            <div key={doc.id} className="document-mobile-card">
                                <div className="card-header">
                                    <span className="card-id">#{doc.id}</span>
                                    <span className="status-badge setor-badge">{doc.setor}</span>
                                </div>
                                <div style={{ fontWeight: 700, margin: '5px 0' }}>{doc.titulo}</div>
                                <div className="card-row">
                                    <label>Tipo:</label>
                                    <span>{doc.tipo_documento}</span>
                                </div>
                                {isAdmin && (
                                    <div className="card-row">
                                        <label>Cliente:</label>
                                        <span>{doc.cliente_nome || '—'}</span>
                                    </div>
                                )}
                                <div className="card-row">
                                    <label>Competência:</label>
                                    <span>{doc.competencia}</span>
                                </div>
                                <div className="card-row">
                                    <label>Data:</label>
                                    <span>{formatDate(doc.data_upload)}</span>
                                </div>
                                <div className="card-actions">
                                    <button className="action-btn view-btn" onClick={() => handleView(doc)}>
                                        <ViewIcon /> Visualizar
                                    </button>
                                    <button className="action-btn download-btn" onClick={() => handleDownload(doc)}>
                                        <DownloadIcon /> Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <button 
                        className="pagination-btn" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button 
                        className="pagination-btn" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
}
