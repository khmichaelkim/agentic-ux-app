"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSLOs } from "@/lib/mock-data/services";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Target
} from "lucide-react";

export function SLOSummary() {
  const healthyCount = mockSLOs.filter(s => s.status === 'meeting').length;
  const unhealthyCount = mockSLOs.filter(s => s.status !== 'meeting').length;
  const atRiskCount = mockSLOs.filter(s => s.status === 'at_risk').length;
  const breachingCount = mockSLOs.filter(s => s.status === 'breaching').length;
  
  const stats = [
    {
      label: "Healthy",
      value: healthyCount,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      label: "At Risk", 
      value: atRiskCount,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10", 
      border: "border-yellow-500/20"
    },
    {
      label: "Breaching",
      value: breachingCount,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20">
          <Target className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">SLO Overview</h2>
          <p className="text-xs text-muted-foreground">
            {mockSLOs.length} total • {unhealthyCount} need attention
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className={`border ${stat.border} ${stat.bg} hover:border-opacity-40 transition-all`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className={`p-1.5 rounded-full ${stat.bg} ${stat.color}`}
                    animate={{
                      scale: stat.label === 'Breaching' && stat.value > 0 ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: stat.label === 'Breaching' && stat.value > 0 ? Infinity : 0
                    }}
                  >
                    <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">{stat.value}</span>
                      <Badge 
                        variant={stat.label === 'Healthy' ? 'secondary' : stat.label === 'Breaching' ? 'destructive' : 'outline'}
                        className="text-xs px-1 py-0"
                      >
                        {((stat.value / mockSLOs.length) * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}