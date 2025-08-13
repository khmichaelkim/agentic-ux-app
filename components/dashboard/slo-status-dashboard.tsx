"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockSLOs, type SLOStatus } from "@/lib/mock-data/services";
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Target,
  TrendingDown,
  AlertTriangle
} from "lucide-react";

const SLOStatusIcon = ({ status }: { status: SLOStatus['status'] }) => {
  const config = {
    meeting: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/20" },
    at_risk: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/20" },
    breaching: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/20" }
  };
  
  const { icon: Icon, color, bg } = config[status];
  
  return (
    <motion.div 
      className={`p-2 rounded-full ${bg}`}
      animate={{ 
        scale: status === 'breaching' ? [1, 1.2, 1] : 1,
      }}
      transition={{ 
        duration: 1.5, 
        repeat: status === 'breaching' ? Infinity : 0 
      }}
    >
      <Icon className={`h-4 w-4 ${color}`} />
    </motion.div>
  );
};

const SLOCard = ({ 
  slo, 
  index 
}: { 
  slo: SLOStatus; 
  index: number; 
}) => {
  const isLatency = slo.type === 'latency';
  const isBreaching = slo.status === 'breaching';
  const budgetPercentage = Math.max(0, slo.remainingBudget);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`border-border/50 hover:border-border transition-all ${
        isBreaching ? 'ring-1 ring-red-500/30' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SLOStatusIcon status={slo.status} />
              <div>
                <CardTitle className="text-sm font-medium">
                  {slo.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {slo.service}
                </p>
              </div>
            </div>
            <Badge 
              variant={isBreaching ? "destructive" : slo.status === 'at_risk' ? "outline" : "secondary"}
              className="text-xs capitalize"
            >
              {slo.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Target vs Current */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="space-y-1"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span className="text-xs">Target</span>
                </div>
                <div className="font-semibold text-sm">
                  {isLatency ? `${slo.target}ms` : `${slo.target}%`}
                </div>
              </motion.div>
              
              <motion.div 
                className="space-y-1"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-xs">Current</span>
                </div>
                <div className={`font-semibold text-sm ${
                  isBreaching ? 'text-red-500' : 
                  slo.status === 'at_risk' ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {isLatency ? `${slo.current}ms` : `${slo.current}%`}
                </div>
              </motion.div>
            </div>
            
            {/* Error Budget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Error Budget</span>
                <span className="text-xs font-medium">{budgetPercentage}%</span>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="origin-left"
              >
                <Progress 
                  value={budgetPercentage} 
                  className="h-2"
                />
              </motion.div>
            </div>
            
            {/* Last Breach */}
            {slo.lastBreach && (
              <motion.div 
                className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Clock className="h-3 w-3" />
                <span>
                  Last breach: {Math.floor((Date.now() - slo.lastBreach.getTime()) / 60000)}m ago
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function SLOStatusDashboard() {
  const meetingCount = mockSLOs.filter(s => s.status === 'meeting').length;
  const atRiskCount = mockSLOs.filter(s => s.status === 'at_risk').length;
  const breachingCount = mockSLOs.filter(s => s.status === 'breaching').length;
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-2">SLO Status Dashboard</h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>{meetingCount} Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>{atRiskCount} At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>{breachingCount} Breaching</span>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {mockSLOs.map((slo, index) => (
          <SLOCard 
            key={slo.id} 
            slo={slo} 
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}