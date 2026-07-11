import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { fetchPorIntegrante } from '../services/appsScript';

const CORES = ['#f2622e', '#4fb3ff', '#6fbf8b', '#e8b84b', '#b98cf0', '#ff5d7a', '#4fd1c5'];

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip mono">
      <strong>{label}</strong>
      {payload.map((p) => (
        <span key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatBRL(p.value)}
        </span>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="chart-tooltip mono">
      <strong>{p.name}</strong>
      <span>{formatBRL(p.value)} ({p.payload.pct.toFixed(0)}%)</span>
    </div>
  );
}

export default function MemberBreakdown({ orcamentos }) {
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orcamentos || orcamentos.length === 0) return;
    setLoading(true);

    Promise.all(orcamentos.map((o) => fetchPorIntegrante(o.id)))
      .then((listas) => {
        const somaPorPessoa = new Map();
        listas.flat().forEach((l) => {
          const atual = somaPorPessoa.get(l.uid) || { uid: l.uid, nome: l.nome, despesas: 0, receitas: 0 };
          atual.despesas += l.despesas;
          atual.receitas += l.receitas;
          somaPorPessoa.set(l.uid, atual);
        });
        setLinhas(Array.from(somaPorPessoa.values()).sort((a, b) => b.despesas - a.despesas));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orcamentos]);

  if (!orcamentos || orcamentos.length === 0 || (!loading && linhas.length === 0)) return null;

  const dadosGrafico = linhas.map((l) => ({ nome: l.nome, Despesas: l.despesas, Receitas: l.receitas }));

  const totalDespesas = linhas.reduce((s, l) => s + l.despesas, 0);
  const dadosPizza = linhas
    .filter((l) => l.despesas > 0)
    .map((l) => ({ nome: l.nome, valor: l.despesas, pct: totalDespesas > 0 ? (l.despesas / totalDespesas) * 100 : 0 }));

  return (
    <>
      <div className="panel">
        <h2 className="panel__title">Por integrante</h2>

        <ResponsiveContainer width="100%" height={Math.max(120, linhas.length * 50)}>
          <BarChart data={dadosGrafico} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="nome"
              width={72}
              tick={{ fill: 'var(--muted)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(17,17,20,0.04)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Despesas" fill="var(--danger)" radius={[0, 4, 4, 0]} barSize={14} />
            <Bar dataKey="Receitas" fill="var(--good)" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>

        <div className="member-list" style={{ marginTop: 8 }}>
          {linhas.map((l) => (
            <div key={l.uid} className="member-row">
              <span className="member-row__nome">{l.nome}</span>
              <div className="member-row__valores">
                <span className="mono text-danger">-{formatBRL(l.despesas)}</span>
                {l.receitas > 0 && <span className="mono text-good">+{formatBRL(l.receitas)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {dadosPizza.length > 0 && (
        <div className="panel">
          <h2 className="panel__title">% de despesas por integrante</h2>
          <div className="pie-layout">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={dadosPizza} dataKey="valor" nameKey="nome" innerRadius={42} outerRadius={72} paddingAngle={2}>
                  {dadosPizza.map((entry, i) => (
                    <Cell key={entry.nome} fill={CORES[i % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {dadosPizza.map((entry, i) => (
                <div key={entry.nome} className="pie-legend__item">
                  <span className="pie-legend__dot" style={{ background: CORES[i % CORES.length] }} />
                  <span className="pie-legend__label">
                    {entry.nome} · {entry.pct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
