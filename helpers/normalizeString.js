export default function normalizeString(str='') {
    const slug = str.toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') //TODO: Eliminar tíldes
    .replace(/[^\w\s]/g, '') //TODO: Eliminar caracteres no alfanuméricos
    .replace(/\s+/g, '_'); //TODO: Reemplazar espacios en blanco por guiones bajos

    return slug;
};
