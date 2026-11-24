import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { getProducts } from '../api';
import type { TypeAgg } from '../workers/aggregate.worker';

const COLORS = ['#86b817', '#4a90d9', '#e8a33d', '#d9534f', '#6f42c1', '#20c997'];

export default function DashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<TypeAgg[]>([]);

  useEffect(() => {
    let worker: Worker | undefined;
    getProducts().then((products) => {
      // Web Worker: aggregation runs off the main thread
      worker = new Worker(new URL('../workers/aggregate.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e: MessageEvent<TypeAgg[]>) => setData(e.data);
      worker.postMessage(products);
    });
    return () => worker?.terminate();
  }, []);

  const totalProducts = data.reduce((s, d) => s + d.count, 0);
  const totalValue = data.reduce((s, d) => s + d.totalUsd, 0);

  return (
    <div className="dashboard">
      <h1 className="page-title">{t('dashboard.title')}</h1>

      <div className="dashboard__stats">
        <div className="stat-card"><span>{t('dashboard.types')}</span><b>{data.length}</b></div>
        <div className="stat-card"><span>{t('dashboard.products')}</span><b>{totalProducts}</b></div>
        <div className="stat-card"><span>{t('dashboard.sum')}</span><b>{totalValue.toLocaleString('ru-RU')}</b></div>
      </div>

      <div className="dashboard__charts">
        <div className="chart-box">
          <h3>{t('dashboard.byType')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="type" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" name={t('dashboard.count')} fill="#86b817" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>{t('dashboard.valueByType')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data} dataKey="totalUsd" nameKey="type" outerRadius={95} label>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
