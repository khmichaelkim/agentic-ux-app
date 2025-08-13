"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Settings, 
  Bell, 
  User,
  Activity,
  Cloud,
  Shield,
  Zap
} from "lucide-react";

// Import our dashboard widgets
import { ServiceHealthOverview } from "@/components/dashboard/service-health-overview";
import { SLOStatusDashboard } from "@/components/dashboard/slo-status-dashboard";
import { InteractiveServiceMap } from "@/components/dashboard/interactive/interactive-service-map";
import { RealTimeMetricsChart } from "@/components/dashboard/real-time-metrics-chart";
import { AlertStatusFeed } from "@/components/dashboard/alert-status-feed";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-2 rounded-lg bg-primary/10"
            >
              <Cloud className="h-6 w-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold">AWS Observability Console</h1>
              <p className="text-sm text-muted-foreground">
                Real-time monitoring and service insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <Badge variant="outline" className="text-xs">
                Region: us-east-1
              </Badge>
            </motion.div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

const QuickStats = () => {
  const stats = [
    { label: "Total Services", value: "5", icon: Zap, color: "text-blue-500" },
    { label: "Active Alerts", value: "3", icon: Bell, color: "text-red-500" },
    { label: "SLOs Breaching", value: "1", icon: Shield, color: "text-yellow-500" },
    { label: "Uptime", value: "99.2%", icon: Activity, color: "text-green-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-card border border-border/50 rounded-lg p-4 flex items-center gap-3"
        >
          <div className={`p-2 rounded-full bg-current/10 ${stat.color}`}>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </div>
          <div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <QuickStats />
        
        {/* Main Dashboard Grid */}
        <div className="space-y-8">
          {/* Row 1: Service Health Overview (Full Width) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ServiceHealthOverview />
          </motion.section>
          
          {/* Row 2: SLO Status and Dependency Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-8"
          >
            <SLOStatusDashboard />
            <InteractiveServiceMap />
          </motion.div>
          
          {/* Row 3: Real-time Metrics (Full Width) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <RealTimeMetricsChart />
          </motion.section>
          
          {/* Row 4: Alert Status Feed (Full Width) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <AlertStatusFeed />
          </motion.section>
        </div>
        
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground"
        >
          <p>AWS Observability Console • Real-time monitoring and insights</p>
        </motion.footer>
      </main>
    </div>
  );
}