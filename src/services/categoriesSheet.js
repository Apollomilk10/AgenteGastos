const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export async function fetchCustomCategories({ email, token, orcamentoId }) {
  if (!SCRIPT_URL || !email || !token || !orcamentoId) return [];

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'listCategorias', email, token, orcamentoId }),
    });
    if (!response.ok) return [];

    const result = await response.json();
    if (result.status !== 'ok') return [];

    return result.rows.map((row) => ({
      categoriaChave: (row.categoriaChave || '').toString().trim(),
      categoriaLabel: (row.categoriaLabel || '').toString().trim(),
      subcategoriaChave: (row.subcategoriaChave || '').toString().trim(),
      subcategoriaLabel: (row.subcategoriaLabel || '').toString().trim(),
    }));
  } catch {
    return [];
  }
}
