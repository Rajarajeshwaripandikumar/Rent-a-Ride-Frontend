import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", cars: 40, bikes: 25, suvs: 15 },
  { month: "Feb", cars: 35, bikes: 30, suvs: 20 },
  { month: "Mar", cars: 50, bikes: 28, suvs: 22 },
  { month: "Apr", cars: 45, bikes: 35, suvs: 24 },
  { month: "May", cars: 60, bikes: 32, suvs: 26 },
  { month: "Jun", cars: 70, bikes: 40, suvs: 30 },
];

const Stack = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 select-none">
      {/* Header */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
          Analytics
        </span>

        <h2 className="text-lg font-semibold text-slate-900 mt-2">
          Bookings by Vehicle Type (Stacked)
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Compare bookings for cars, bikes, and SUVs across months.
        </p>
      </div>

      {/* Chart */}
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

            <XAxis
              dataKey="month"
              stroke="#64748B"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />

            <YAxis
              stroke="#64748B"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                boxShadow: "0 4px 12px rgba(15,23,42,0.10)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#64748B", fontWeight: 500 }}
            />

            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="circle"
            />

            {/* Dashboard palette: blue, yellow, green */}
            <Bar dataKey="cars"  stackId="a" fill="#3B82F6" />
            <Bar dataKey="bikes" stackId="a" fill="#FACC15" />
            <Bar dataKey="suvs"  stackId="a" fill="#22C55E" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Stack;
