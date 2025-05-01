
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WaterQualityData } from "@/types/water-quality";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO } from "date-fns";

interface WaterQualityChartProps {
  data: WaterQualityData[];
  parameter: keyof Omit<WaterQualityData, 'timestamp'>;
  title: string;
  color: string;
  unit: string;
}

const WaterQualityChart = ({ data, parameter, title, color, unit }: WaterQualityChartProps) => {
  // Limit the data to the last 100 entries
  const limitedData = data.slice(-100);

  // Format the timestamp for display on the x-axis
  const chartData = limitedData.map(item => {
    let displayTime;
    try {
      // Parse the ISO string to a Date object
      const date = parseISO(item.timestamp);
      // Format it to show date and time in a readable format
      displayTime = format(date, "MM/dd HH:mm");
    } catch (error) {
      // Fallback in case of parsing errors
      console.error("Error parsing date:", error);
      displayTime = "Invalid date";
    }
    
    return {
      ...item,
      displayTime,
    };
  });

  return (
    <Card className="col-span-2 border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayTime" 
                label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: unit, angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value: number) => [`${value} ${unit}`, title]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={parameter} 
                stroke={color} 
                activeDot={{ r: 8 }}
                name={title} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterQualityChart;
