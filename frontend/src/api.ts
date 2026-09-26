import { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationStateSnapshot, BenchmarkPayload } from './types';

const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws/live';

export async function fetchStatus(): Promise<SimulationStateSnapshot> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function startSimulation() {
  const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
  return res.json();
}

export async function pauseSimulation() {
  const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
  return res.json();
}

export async function resetSimulation() {
  const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
  return res.json();
}

export async function stepSimulation() {
  const res = await fetch(`${API_BASE}/simulation/step`, { method: 'POST' });
  return res.json();
}

export async function setMissionMode(mode: string) {
  const res = await fetch(`${API_BASE}/mission-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  return res.json();
}

export async function setEnvironmentPreset(preset: string) {
  const res = await fetch(`${API_BASE}/environment/preset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset })
  });
  return res.json();
}

export async function triggerAnomaly() {
  const res = await fetch(`${API_BASE}/environment/anomaly`, { method: 'POST' });
  return res.json();
}

export async function runBenchmark(slots = 100, preset = 'Dense Spectrum'): Promise<BenchmarkPayload> {
  const res = await fetch(`${API_BASE}/benchmark/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slots, preset })
  });
  if (!res.ok) throw new Error('Benchmark failed');
  return res.json();
}

export async function startJudgeDemo() {
  const res = await fetch(`${API_BASE}/demo/start`, { method: 'POST' });
  return res.json();
}

export async function stopJudgeDemo() {
  const res = await fetch(`${API_BASE}/demo/stop`, { method: 'POST' });
  return res.json();
}

export async function evaluateWhatIf(candidate_band: string, dwell_slots = 2) {
  const res = await fetch(`${API_BASE}/counterfactual/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_band, dwell_slots })
  });
  return res.json();
}

export async function updateRobustness(config: {
  noise_floor_dbm?: number;
  interference_level?: number;
  p_false_alarm_base?: number;
  p_miss_base?: number;
  simulation_speed_ms?: number;
}) {
  const res = await fetch(`${API_BASE}/environment/robustness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}

export function useLiveSimulation() {
  const [snapshot, setSnapshot] = useState<SimulationStateSnapshot | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setSnapshot(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket connection error:', e);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnection after 1.5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 1500);
      };
    } catch (err: any) {
      setIsConnected(false);
      setError(err?.message || 'WebSocket error');
    }
  }, []);

  useEffect(() => {
    // Initial REST fetch in case WebSocket takes a moment
    fetchStatus()
      .then((data) => setSnapshot(data))
      .catch((e) => console.log('Initial REST fetch fallback waiting for server:', e.message));

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Send action via WebSocket if connected, otherwise fallback to REST
  const sendAction = useCallback((action: string, payload: Record<string, any> = {}) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action, ...payload }));
    } else {
      if (action === 'start') startSimulation();
      else if (action === 'pause') pauseSimulation();
      else if (action === 'reset') resetSimulation();
      else if (action === 'step') stepSimulation();
      else if (action === 'anomaly') triggerAnomaly();
      else if (action === 'demo_start') startJudgeDemo();
      else if (action === 'demo_stop') stopJudgeDemo();
    }
  }, []);

  return { snapshot, isConnected, error, sendAction, setSnapshot };
}
