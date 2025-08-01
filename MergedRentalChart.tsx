import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line
} from 'recharts';

type DataItem = {
  machine: string;
  rental_date: string;
  count: number;
  rainfall: number;
};

type Props = {
  machines: string[];
  setMachines: React.Dispatch<React.SetStateAction<string[]>>;
  selMachine: string;
  setSelMachine: React.Dispatch<React.SetStateAction<string>>;
  selYear: number;
  setSelYear: React.Dispatch<React.SetStateAction<number>>;
};

const MergedRentalChart: React.FC<Props> = ({
  machines,
  setMachines,
  selMachine,
  setSelMachine,
  selYear,
  setSelYear
}) => {
  const [rawData, setRawData] = useState<DataItem[]>([]);

  useEffect(() => {
    Papa.parse<DataItem>('/data/merged_rental_weather.csv', {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        setRawData(data);

        // 기종 리스트 세팅
        const list = Array.from(new Set(data.map(d => d.machine))).sort();
        setMachines(list);
        if (!selMachine && list.length > 0) {
          setSelMachine(list[0]);
        }

        // 연도 기본값 세팅
        const yearList = Array.from(
          new Set(data.map(d => new Date(d.rental_date).getFullYear()))
        ).sort();
        if (!yearList.includes(selYear) && yearList.length > 0) {
          setSelYear(yearList[0]);
        }
      }
    });
  }, [selMachine, selYear, setMachines, setSelMachine, setSelYear]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(rawData.map(d => new Date(d.rental_date).getFullYear()))
      ).sort(),
    [rawData]
  );

  const chartData = useMemo(() => {
    if (!selMachine || !selYear) return [];
    const filtered = rawData.filter(
      d =>
        d.machine === selMachine &&
        new Date(d.rental_date).getFullYear() === selYear
    );
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const items = filtered.filter(
        d => new Date(d.rental_date).getMonth() + 1 === month
      );
      const countSum = items.reduce((sum, d) => sum + d.count, 0);
      const avgRain =
        items.length > 0
          ? Number((items.reduce((sum, d) => sum + d.rainfall, 0) / items.length).toFixed(1))
          : 0;
      return { month, count: countSum, avgRain };
    });
  }, [rawData, selMachine, selYear]);

  return (
    <div style={{ padding: '1rem', background: '#fff', borderRadius: 8, marginBottom: '1rem' }}>
      <h2>🚜 기종별 실제 임대 & 평균 강수량</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <select
          style={{ minWidth: '150px' }}
          value={selMachine}
          onChange={e => setSelMachine(e.target.value)}
        >
          <option value="">기종 선택</option>
          {machines.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          style={{ minWidth: '200px' }}
          value={selYear}
          onChange={e => setSelYear(Number(e.target.value))}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="300%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 30, bottom: 20, left: 40, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={m => `${m}월`} />
          <YAxis
            yAxisId="left"
            label={{ value: '임대 건수', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: '평균 강수량 (mm)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
  formatter={(value, name) => {
    if (name === 'count') return [value, '임대 건수'];
    if (name === 'avgRain') return [value, '평균 강수량'];
    return [value, name];
  }}
/>

          <Legend verticalAlign="top" />
          <Bar yAxisId="left" dataKey="count" name="임대 건수" fill="#4e79a7" />
          <Line yAxisId="right" dataKey="avgRain" name="평균 강수량" stroke="#e15759" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MergedRentalChart;
