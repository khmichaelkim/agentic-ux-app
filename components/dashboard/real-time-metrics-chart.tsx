"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { generateMockTimeSeries } from "@/lib/mock-data/services";
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";
import { format } from 'date-fns';

interface ChartData {
  timestamp: string;
  errors: number;
  latency: number;
  throughput: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg p-3 shadow-lg"
      >
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.name === 'Latency' ? `${entry.value}ms` : 
               entry.name === 'Errors' ? `${entry.value.toFixed(2)}%` :
               `${entry.value}`}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  icon: Icon, 
  color,
  index 
}: {
  title: string;
  value: number;
  unit: string;
  trend: number;
  icon: any;
  color: string;
  index: number;
}) => {
  const isPositive = trend > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-full ${color}/20`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <Badge variant={Math.abs(trend) > 10 ? "destructive" : "secondary"} className="text-xs">
              {isPositive ? '+' : ''}{trend.toFixed(1)}%
            </Badge>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className="text-lg font-bold">
              {value.toLocaleString()}{unit}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function RealTimeMetricsChart() {
  // Generate mock time series data
  const errorData = generateMockTimeSeries(2, 2.5, 3);
  const latencyData = generateMockTimeSeries(2, 1200, 400);
  const throughputData = generateMockTimeSeries(2, 1500, 200);
  
  // Combine data for chart
  const chartData: ChartData[] = errorData.map((point, index) => ({
    timestamp: format(point.timestamp, 'HH:mm'),
    errors: point.value,
    latency: latencyData[index]?.value || 0,
    throughput: throughputData[index]?.value || 0,
  }));
  
  // Calculate current values and trends
  const currentErrors = errorData[errorData.length - 1].value;
  const currentLatency = latencyData[latencyData.length - 1].value;
  const currentThroughput = throughputData[throughputData.length - 1].value;
  
  const errorTrend = ((currentErrors - errorData[errorData.length - 10].value) / errorData[errorData.length - 10].value) * 100;
  const latencyTrend = ((currentLatency - latencyData[latencyData.length - 10].value) / latencyData[latencyData.length - 10].value) * 100;
  const throughputTrend = ((currentThroughput - throughputData[throughputData.length - 10].value) / throughputData[throughputData.length - 10].value) * 100;
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2">Real-time Metrics</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Live performance data from the last 2 hours
        </p>
      </motion.div>
      
      {/* Current Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Error Rate"
          value={currentErrors}
          unit="%"
          trend={errorTrend}
          icon={AlertTriangle}
          color="text-red-500"
          index={0}
        />
        <MetricCard
          title="P99 Latency"
          value={currentLatency}
          unit="ms"
          trend={latencyTrend}
          icon={Clock}
          color="text-yellow-500"
          index={1}
        />
        <MetricCard
          title="Throughput"
          value={currentThroughput}
          unit="/min"
          trend={throughputTrend}
          icon={TrendingUp}
          color="text-blue-500"
          index={2}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Rate Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" />
                Error Rate Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#errorGradient)"
                    name="Errors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Latency Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Latency Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}ms`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="Latency"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Throughput Chart - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Throughput Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#throughputGradient)"
                  name="Throughput"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}