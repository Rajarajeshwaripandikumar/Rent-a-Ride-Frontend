// src/components/LineChart.jsx
import React from "react";
import Chart from "react-apexcharts";

const LineChart = ({ labels = [], series = [] }) => {
  const allValues = series.flatMap((s) => s.data || []);
  const maxVal = allValues.length ? Math.max(...allValues) : 0;
  const yMax = maxVal ? Math.ceil(maxVal * 1.2) : 1000; // 20% headroom

  const options = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: "#64748B",
      fontFamily: "Inter, sans-serif",
      animations: {
        enabled: true,
        easing: "easeout",
        speed: 700,
      },
    },

    stroke: {
      curve: "smooth",
      width: 4,
    },

    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        shadeIntensity: 0.4,
        type: "vertical",
        gradientToColors: ["#4ea8ff"], // lighter blue glow
        opacityFrom: 0.45,
        opacityTo: 0,
        stops: [0, 80, 100],
      },
    },

    markers: {
      size: 6,
      colors: ["#ffffff"],
      strokeColors: "#0071DC",
      strokeWidth: 3,
      hover: {
        size: 8,
      },
    },

    colors: ["#0071DC"],

    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 5,
      padding: {
        top: 10,
        bottom: 10,
        left: 0,
        right: 0,
      },
    },

    xaxis: {
      categories: labels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },

    yaxis: {
      min: 0,
      max: yMax,
      tickAmount: 4,
      labels: {
        formatter: (val) =>
          `₹${val.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`,
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },

    tooltip: {
      theme: "light",
      marker: { show: false },
      y: {
        formatter: (value) =>
          `₹${value.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`,
      },
    },

    legend: { show: false },
  };

  return (
    <div className="w-full">
      <Chart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default LineChart;
