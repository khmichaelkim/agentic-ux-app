"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockSLOs, type SLOStatus } from "@/lib/mock-data/services";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const SLOStatusIcon = ({ status }: { status: SLOStatus['status'] }) => {
  const config = {
    meeting: { icon: CheckCircle, color: "text-green-500" },
    at_risk: { icon: AlertTriangle, color: "text-yellow-500" },
    breaching: { icon: AlertCircle, color: "text-red-500" }
  };
  
  const { icon: Icon, color } = config[status];
  
  return (
    <motion.div
      animate={{
        scale: status === 'breaching' ? [1, 1.1, 1] : 1,
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

const SLOListItem = ({ slo, index }: { slo: SLOStatus; index: number }) => {
  const isLatency = slo.type === 'latency';
  const isBreaching = slo.status === 'breaching';
  const budgetPercentage = Math.max(0, slo.remainingBudget);
  
  const isCurrentBetter = isLatency ? 
    slo.current <= slo.target : 
    slo.current >= slo.target;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ x: 2, scale: 1.005 }}
      className={`p-2 rounded border transition-all cursor-pointer ${
        isBreaching ? 'border-red-200 bg-red-50/50 hover:bg-red-50' : 
        slo.status === 'at_risk' ? 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50' :
        'border-green-200 bg-green-50/50 hover:bg-green-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <SLOStatusIcon status={slo.status} />
          <div className="min-w-0">
            <div className="font-medium text-xs truncate">{slo.name}</div>
            <div className="text-xs text-muted-foreground truncate">{slo.service}</div>
          </div>
        </div>
        <Badge 
          variant={isBreaching ? "destructive" : slo.status === 'at_risk' ? "outline" : "secondary"}
          className="text-xs capitalize px-1 py-0 ml-1"
        >
          {slo.status.replace('_', ' ')}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs mb-1">
        <div>
          <div className="text-muted-foreground text-xs">Target</div>
          <div className="font-semibold text-xs">
            {isLatency ? `${slo.target}ms` : `${slo.target}%`}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground flex items-center gap-0.5 text-xs">
            Current
            {isCurrentBetter ? (
              <TrendingUp className="h-2.5 w-2.5 text-green-500" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5 text-red-500" />
            )}
          </div>
          <div className={`font-semibold text-xs ${
            isBreaching ? 'text-red-600' : 
            slo.status === 'at_risk' ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {isLatency ? `${slo.current}ms` : `${slo.current}%`}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Budget</div>
          <div className="flex items-center gap-1">
            <Progress 
              value={budgetPercentage} 
              className="h-1 flex-1"
            />
            <span className="font-semibold text-xs">{budgetPercentage}%</span>
          </div>
        </div>
      </div>
      
      {slo.lastBreach && (
        <div className="pt-1 border-t border-current/10">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            <span>
              Last breach: {Math.floor((Date.now() - slo.lastBreach.getTime()) / 60000)}m ago
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export function SLOList() {
  // Sort SLOs by status priority (breaching first, then at_risk, then meeting)
  const sortedSLOs = [...mockSLOs].sort((a, b) => {
    const statusOrder = { breaching: 0, at_risk: 1, meeting: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Service Level Objectives</CardTitle>
        <p className="text-xs text-muted-foreground">
          Monitor error budgets and performance targets
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4">
          <div className="space-y-2 pb-2">
            {sortedSLOs.map((slo, index) => (
              <SLOListItem 
                key={slo.id} 
                slo={slo} 
                index={index}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}