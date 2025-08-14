"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, CheckCircle, Home } from "lucide-react";
import { useAwsServices } from "@/lib/hooks/use-aws-services";

export default function TestAwsPage() {
  const [showRawData, setShowRawData] = useState(false);
  const { services, loading, error, refetch, isUsingMockData } = useAwsServices({
    autoFetch: true,
    fallbackToMock: true,
  });

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">AWS Application Signals Test</h1>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">
          Testing integration with real AWS Application Signals API using local credentials
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connection Status</CardTitle>
            <Button 
              onClick={refetch} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {loading && <Badge variant="secondary">Loading...</Badge>}
              {!loading && error && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Error
                </Badge>
              )}
              {!loading && !error && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Data Source:</span>
              <Badge variant={isUsingMockData ? "outline" : "default"}>
                {isUsingMockData ? "Mock Data (Fallback)" : "AWS Application Signals"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">Services Found:</span>
              <span>{services.length}</span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                <strong>Error Details:</strong> {error.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {services.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ListServices</CardTitle>
              <Button
                onClick={() => setShowRawData(!showRawData)}
                size="sm"
                variant="outline"
              >
                {showRawData ? "Hide" : "Show"} Raw Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between py-2 px-3 border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium text-sm">{service.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {service.environment}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {service.platform}
                  </Badge>
                </div>
              ))}
            </div>

            {showRawData && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Raw Service Data</h3>
                <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                  {JSON.stringify(services, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ensure you have AWS credentials configured locally (check ~/.aws/credentials)</li>
          <li>If using ada: run `ada credentials update --account YOUR_ACCOUNT_ID --role Admin`</li>
          <li>Make sure Application Signals is enabled in your AWS account</li>
          <li>The API will automatically use your local credentials</li>
          <li>If AWS fails, it will fallback to mock data (you can disable this in the hook)</li>
        </ol>
      </div>
    </div>
  );
}