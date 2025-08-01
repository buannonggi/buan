import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

type RentalItem = {
  machine: string;
  rental_date: string;
  count: number;
};

function RentalChart() {
  const [data, setData] = useState<RentalItem[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMachine, setSelectedMachine] = useState<string>('이앙기');
  const [yearList, setYearList] = useState<number[]>([]);
  const [machineList, setMachineList] = useState<string[]>([]);

  useEffect(() => {
    Papa.parse<RentalItem>('/data/merged_rental_weather.csv', {
      header: true,
      download: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        setData(data);

        const years = Array.from(new Set(data.map(d => new Date(d.rental_date).getFullYear()))).sort();
        const machines = Array.from(new Set(data.map(d => d.machine))).sort();

        setYearList(years);
        setMachineList(machines);

        if (!years.includes(selectedYear)) setSelectedYear(years[0]);
        if (!machines.includes(selectedMachine)) setSelectedMachine(machines[0]);
      },
    });
  }, []);

  const chartData = useMemo(() => {
    return data
      .filter(
        item =>
          new Date(item.rental_date).getFullYear() === selectedYear &&
          item.machine === selectedMachine,
      )
      .reduce((acc, cur) => {
        const month = new Date(cur.rental_date).getMonth() + 1;
        const found = acc.find(a => a.month === month);
        if (found) found.count += cur.count;
        else acc.push({ month, count: cur.count });
        return acc;
      }, [] as { month: number; count: number }[])
      .sort((a, b) => a.month - b.month);
  }, [data, selectedYear, selectedMachine]);

  const boardWidth = 1600;
  const boardHeight = 700;

  return (
    <div
      style={{
        width: `${boardWidth}px`,
        height: `${boardHeight}px`,
        padding: '20px',
        background: '#fafafa',
        borderRadius: 8,
        margin: '0 auto',
      }}
    >
      <select
        value={selectedYear}
        onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
      >
        {yearList.map(year => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </select>

      <select
        value={selectedMachine}
        onChange={e => setSelectedMachine(e.target.value)}
      >
        {machineList.map(machine => (
          <option key={machine} value={machine}>
            {machine}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 40, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickFormatter={m => `${m}월`} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="실제 임대 건수" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RentalChart;
