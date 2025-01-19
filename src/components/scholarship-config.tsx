// components/ScholarshipConfig.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScholarshipConfig } from '../types';

interface ScholarshipConfigProps {
  config: ScholarshipConfig;
  onChange: (config: ScholarshipConfig) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
  preferredCurrency: string;
}

export function ScholarshipConfig({
  config,
  onChange,
  duration,
  onDurationChange,
  preferredCurrency
}: ScholarshipConfigProps) {
  const handleChange = (field: keyof ScholarshipConfig, value: number) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scholarship Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stay Duration (months)</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => onDurationChange(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((months) => (
                  <SelectItem key={months} value={months.toString()}>
                    {months} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Monthly Grant ({preferredCurrency})</Label>
            <Input
              type="number"
              value={config.monthlyGrant}
              onChange={(e) => handleChange('monthlyGrant', Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Funded Months</Label>
            <Input
              type="number"
              value={config.maxMonths}
              onChange={(e) => handleChange('maxMonths', Number(e.target.value))}
              max={duration}
            />
            {config.maxMonths > duration && (
              <Alert variant="warning">
                <AlertDescription>
                  Maximum funded months cannot exceed total stay duration.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label>Travel Support ({preferredCurrency})</Label>
            <Input
              type="number"
              value={config.travelSupport}
              onChange={(e) => handleChange('travelSupport', Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Support ({preferredCurrency})</Label>
            <Input
              type="number"
              value={config.additionalSupport || 0}
              onChange={(e) => handleChange('additionalSupport', Number(e.target.value))}
              placeholder="Optional additional funding"
            />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Scholarship Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Monthly Support:</span>
              <span>{config.monthlyGrant * config.maxMonths} {preferredCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span>Travel Support:</span>
              <span>{config.travelSupport} {preferredCurrency}</span>
            </div>
            {config.additionalSupport && (
              <div className="flex justify-between">
                <span>Additional Support:</span>
                <span>{config.additionalSupport} {preferredCurrency}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total Support:</span>
              <span>
                {(config.monthlyGrant * config.maxMonths) + 
                  config.travelSupport + 
                  (config.additionalSupport || 0)
                } {preferredCurrency}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}