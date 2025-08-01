import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Line
} from 'recharts';

type PredictionRaw = {
  year_month: string;
  machine: string;
  predicted_count: number;
  rainfall: number;
  temperature: number;
};

type DataItem = {
  month: number;
  forecastCount: number;
  rainfall: number;
  temperature: number;
};

type Props = {
  selYear: number;
  selMachine: string;
};

export default function ForecastBoard({ selYear, selMachine }: Props) {
  const [predictions, setPredictions] = useState<PredictionRaw[]>([]);

  useEffect(() => {
    Papa.parse<PredictionRaw>('/data/machine_monthly_predictions.csv', {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        setPredictions(data);
      }
    });
  }, []);

  const data: DataItem[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const ym = `${selYear}-${String(m).padStart(2, '0')}`;
      const rec = predictions.find(
        p => p.year_month === ym && p.machine === selMachine
      );
      return {
        month: m,
        forecastCount: rec ? rec.predicted_count : 0,
        rainfall: rec ? rec.rainfall : 0,
        temperature: rec ? rec.temperature : 0
      };
    });
  }, [predictions, selYear, selMachine]);

  return (
    <div style={{ padding: '1rem', background: '#fafafa', borderRadius: 8, marginTop: '2rem' }}>
      <h2>🔮 기종별 예측 임대 건수 및 날씨 정보</h2>
      <ResponsiveContainer width="300%" height={300}>
        <BarChart data={data} margin={{ top: 20, bottom: 20, left: 20, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={m => `${m}월`} />
          <YAxis yAxisId="left" label={{ value: '예측 건수', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '강수량(mm)/기온(°C)', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend verticalAlign="top" />
          <Bar yAxisId="left" dataKey="forecastCount" name="예측 임대 건수" fill="#f28e2c" />
          <Line yAxisId="right" type="monotone" dataKey="rainfall" name="예측 강수량(mm)" stroke="#4e79a7" strokeWidth={2} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="temperature" name="예측 기온(°C)" stroke="#e15759" strokeWidth={2} dot={{ r: 3 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
