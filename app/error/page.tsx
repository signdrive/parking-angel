'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorPage() {
  useEffect(() => {
    // Error boundary handles logging
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error while processing your request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Our team has been notified and is working to resolve the issue.
            Please try again in a few moments.
          </p>
          <div className="space-y-2">
            <p className="text-sm">You can try:</p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Refreshing the page</li>
              <li>Clearing your browser cache</li>
              <li>Logging out and back in</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
