import {
  PieChart,
  Pie as RePie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "Approved", value: 62 },
  { name: "Pending", value: 24 },
  { name: "Rejected", value: 14 },
];

const COLORS = ["#3B82F6", "#FACC15", "#EF4444"];

const Pie = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 select-none">
      {/* Header */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2 py-[2px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-md">
          Analytics
        </span>

        <h2 className="text-lg font-semibold text-slate-900 mt-2">
          Vehicle Approval Distribution
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Overview of approved, pending, and rejected vehicles.
        </p>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                background: "#ffffff",
                boxShadow: "0 4px 12px rgba(15,23,42,0.10)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#64748B" }}
            />

            {/* Pie */}
            <RePie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </RePie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Pie;
