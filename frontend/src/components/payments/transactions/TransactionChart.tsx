import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TransactionChartProps {
  transactions: {
    purchasedItems: { category: string; totalPrice: number }[];
  }[];
}

export default function TransactionChart({
  transactions,
}: TransactionChartProps) {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#ffbb28"]; // Color Palette

  // Aggregate spending by category
  const data = transactions.reduce((acc, tx) => {
    tx.purchasedItems.forEach((item) => {
      const existing = acc.find((d) => d.category === item.category);
      if (existing) {
        existing.amount += item.totalPrice;
      } else {
        acc.push({ category: item.category, amount: item.totalPrice });
      }
    });
    return acc;
  }, [] as { category: string; amount: number }[]);

  // Capitalise first letter of labels
  const Capitalise = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          label={({ name, percent }) =>
            `${Capitalise(name)} ${(percent * 100).toFixed(0)}%`
          } // Capitalised label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `€${value.toFixed(2)}`,
            Capitalise(name),
          ]} // Capitalise & add €
        />
        <Legend formatter={(value) => Capitalise(value)} />{" "}
        {/* Capitalised legend labels */}
      </PieChart>
    </ResponsiveContainer>
  );
}
