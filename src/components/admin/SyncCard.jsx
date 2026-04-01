import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, XSquare } from 'lucide-react';

const DEFAULT_LIMIT = 10;
const MIN_LIMIT = 1;
const MAX_LIMIT = 2000;

const SyncCard = ({
  title,
  icon: Icon,
  lastSync,
  limit,
  onLimitChange,
  onSync,
  onStop,
  isSyncing,
  colorClass
}) => {
  useEffect(() => {
    if (!Number.isFinite(limit) || limit < MIN_LIMIT) {
      onLimitChange?.(DEFAULT_LIMIT);
    }
  }, [limit, onLimitChange]);

  const safeLimit = useMemo(() => {
    const parsed = Number(limit);
    if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
    return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, parsed));
  }, [limit]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';

    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Never';
    }
  };

  const handleLimitChange = (e) => {
    const rawValue = e.target.value;

    if (rawValue === '') {
      onLimitChange?.(DEFAULT_LIMIT);
      return;
    }

    let value = Number(rawValue);

    if (!Number.isFinite(value)) {
      value = DEFAULT_LIMIT;
    }

    value = Math.floor(value);
    value = Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value));

    onLimitChange?.(value);
  };

  const handleBlur = () => {
    if (!Number.isFinite(limit) || limit < MIN_LIMIT) {
      onLimitChange?.(DEFAULT_LIMIT);
      return;
    }

    if (limit > MAX_LIMIT) {
      onLimitChange?.(MAX_LIMIT);
    }
  };

  return (
    <Card className="glass-effect flex flex-col justify-between h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon ? <Icon className={`w-5 h-5 ${colorClass || ''}`} /> : null}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow flex flex-col justify-end">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Last Sync:</p>
          <p className="text-sm font-medium">{formatDate(lastSync)}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Total Sync Target (1 - 2000)</Label>

          <Input
            type="number"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={1}
            value={safeLimit}
            onChange={handleLimitChange}
            onBlur={handleBlur}
            disabled={isSyncing}
            inputMode="numeric"
          />

          <p className="text-[11px] leading-4 text-muted-foreground">
            Default is 10. Large sync runs in batches, so 1000+ is safe.
          </p>
        </div>

        <div className="flex gap-2 w-full mt-2">
          <Button
            onClick={onSync}
            disabled={isSyncing}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : `Sync ${title}`}
          </Button>

          {isSyncing && (
            <Button
              onClick={onStop}
              variant="destructive"
              size="icon"
              title="Stop Sync"
            >
              <XSquare className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncCard;