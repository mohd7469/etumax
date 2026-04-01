
let syncIntervalId = null;
let isRunning = false;
let currentStatus = 'Idle';

export const startAutoSync = (intervalMinutes, syncCallback) => {
  if (syncIntervalId) clearInterval(syncIntervalId);
  
  if (!intervalMinutes || intervalMinutes <= 0) return;

  currentStatus = `Scheduled (Every ${intervalMinutes}m)`;
  
  syncIntervalId = setInterval(async () => {
    if (isRunning) return;
    try {
      isRunning = true;
      currentStatus = 'Running';
      await syncCallback();
    } catch (e) {
      console.error('Auto sync error:', e);
    } finally {
      isRunning = false;
      currentStatus = `Scheduled (Every ${intervalMinutes}m)`;
    }
  }, intervalMinutes * 60 * 1000);
};

export const stopAutoSync = () => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  isRunning = false;
  currentStatus = 'Idle';
};

export const getSyncStatus = () => currentStatus;
export const isSyncRunning = () => isRunning;
