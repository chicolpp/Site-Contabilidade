/**
 * Formata uma string de data (ISO ou similar) para o padrão brasileiro DD/MM/YYYY.
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("pt-BR");
    } catch (error) {
        return dateString;
    }
};

/**
 * Formata uma string de data e hora para o padrão brasileiro DD/MM/YYYY HH:mm.
 * @param {string} dateTimeString 
 * @returns {string}
 */
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    try {
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return dateTimeString;
        return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return dateTimeString;
    }
};

/**
 * Formata uma string de hora HH:mm:ss ou HH:mm para HH:mm.
 * @param {string} timeString 
 * @returns {string}
 */
export const formatTime = (timeString) => {
    if (!timeString) return "-";
    return timeString.substring(0, 5);
};
/**
 * Aplica máscara de documento conforme o tipo (CPF, RG, CNH, etc).
 * @param {string} value 
 * @param {string} type 
 * @returns {string}
 */
export const applyDocumentMask = (value, type) => {
    if (!value) return "";
    let v = value.replace(/\D/g, "");

    if (type === "CPF") {
        v = v.substring(0, 11);
        return v.replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    if (type === "CNPJ") {
        v = v.substring(0, 14);
        return v.replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }
    if (type === "RG" || type === "RG/CPF") {
        v = value.replace(/[^\dXx]/g, "").substring(0, 9);
        if (v.length > 8) return v.replace(/^(.{2})(.{3})(.{3})(.{1})$/, "$1.$2.$3-$4");
        if (v.length > 5) return v.replace(/^(.{2})(.{3})(.{1,3})$/, "$1.$2.$3");
        if (v.length > 2) return v.replace(/^(.{2})(.{1,3})$/, "$1.$2");
        return v;
    }
    if (type === "CNH") {
        return v.substring(0, 11);
    }
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
};

/**
 * Aplica máscara de telefone (fixo ou celular).
 * @param {string} value 
 * @returns {string}
 */
export const applyPhoneMask = (value) => {
    if (!value) return "";
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);

    if (v.length > 10) {
        return v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (v.length > 5) {
        return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (v.length > 2) {
        return v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else {
        return v.replace(/^(\d*)/, "($1");
    }
};

/**
 * Aplica máscara de Inscrição Estadual (Genérica até 14 dígitos).
 * @param {string} value 
 * @returns {string}
 */
export const applyIEMask = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "").substring(0, 14);
};

/**
 * Aplica máscara de Inscrição Municipal (Genérica até 15 dígitos).
 * @param {string} value 
 * @returns {string}
 */
export const applyIMMask = (value) => {
    if (!value) return "";
    return value.replace(/\D/g, "").substring(0, 15);
};

/**
 * Valida se um email é bem formatado.
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Aplica máscara de placa veicular brasileira (Padrão ou Mercosul).
 * Padrão: AAA-1234
 * Mercosul: ABC1D23
 * @param {string} value 
 * @returns {string}
 */
export const applyPlateMask = (value) => {
    if (!value) return "";
    let v = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 7);
    
    // Se for o formato antigo (AAA9999) e tiver mais de 3 caracteres, coloca o hífen
    // Mas no Mercosul não tem hífen. Vamos deixar flexível:
    // Se tiver 7 caracteres e o 5º for letra, é Mercosul.
    // Se o usuário digitar, vamos apenas limitar a 7 caracteres e talvez formatar AAA-1234 se não for Mercosul.
    
    if (v.length > 3) {
        // Se o 5º caractere (índice 4) for um número, pode ser padrão antigo.
        // Se for letra, é Mercosul.
        const isLetter = (char) => /[A-Z]/.test(char);
        const isNumber = (char) => /[0-9]/.test(char);

        if (v.length >= 5) {
            if (isNumber(v[4])) {
                // Padrão Antigo: AAA-1234
                return v.substring(0, 3) + "-" + v.substring(3);
            }
        }
    }
    return v;
};
