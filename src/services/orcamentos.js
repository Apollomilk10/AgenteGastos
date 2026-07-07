const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

async function fetchComTimeout(payload, ms = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('O servidor demorou demais para responder (mais de 15s). Tente novamente.');
    }
    throw new Error('Não foi possível conectar ao servidor. Confira sua internet.');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callScript(payload) {
  const response = await fetchComTimeout(payload);
  if (!response.ok) {
    throw new Error(`O servidor respondeu com erro (status ${response.status}).`);
  }
  const rawText = await response.text();
  let result;
  try {
    result = JSON.parse(rawText);
  } catch {
    throw new Error('O Apps Script não retornou um JSON válido. Publique uma "Nova versão" da implantação.');
  }
  if (result.status !== 'ok') {
    throw new Error(result.message || 'Erro desconhecido.');
  }
  return result;
}

export async function fetchOrcamentos({ email, token }) {
  const result = await callScript({ action: 'listOrcamentos', email, token });
  return result.rows;
}

export function criarOrcamento(nome, session) {
  return callScript({ action: 'criarOrcamento', nome, email: session.email, token: session.token });
}

export function entrarOrcamento(codigo, session) {
  return callScript({ action: 'entrarOrcamento', codigo, email: session.email, token: session.token });
}

export async function fetchMeusGastos({ email, token }) {
  const result = await callScript({ action: 'listMeusGastos', email, token });
  return result.rows;
}
