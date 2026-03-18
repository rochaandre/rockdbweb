import requests
import os
import json
from datetime import datetime, timezone
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS

# Configuration
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "rockdb_super_secret_token_change_me")
INFLUX_ORG = os.getenv("INFLUX_ORG", "rockdb")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "timemachine")

client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

def store_snapshot(sessions, long_ops, blocking):
    """Stores a snapshot of database sessions and performance metrics into InfluxDB."""
    try:
        points = []
        timestamp = datetime.now(timezone.utc)
        
        # 1. Sessions Point
        # We store the main metrics as fields and the session list as a JSON string field for 10s snapshots
        session_data = json.dumps(sessions)
        p = Point("oracle_performance") \
            .tag("type", "workload_snapshot") \
            .field("session_count", len(sessions)) \
            .field("active_sessions", len([s for s in sessions if s.get('status') == 'ACTIVE'])) \
            .field("sessions_json", session_data) \
            .field("long_ops_json", json.dumps(long_ops)) \
            .field("blocking_json", json.dumps(blocking)) \
            .time(timestamp, WritePrecision.NS)
        
        points.append(p)
        
        # 2. Individual SQL IDs (optional, for easier querying later if needed)
        # For now, keeping it simple with one high-density point per 10s
        
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=points)
        return True
    except Exception as e:
        print(f"Error storing snapshot in InfluxDB: {e}")
        return False

def get_history_range(start_time_iso, end_time_iso):
    """Retrieves high-level metrics for a time range to populate a timeline using InfluxQL (VictoriaMetrics compatible)."""
    # VictoriaMetrics/InfluxQL query
    query = f'SELECT session_count, active_sessions FROM "oracle_performance" WHERE time >= \'{start_time_iso}\' AND time <= \'{end_time_iso}\' AND type = \'workload_snapshot\''
    
    try:
        # Use v1 query API for InfluxQL compatibility (VictoriaMetrics supports this at /query)
        params = {
            'db': INFLUX_BUCKET,
            'q': query
        }
        response = requests.get(f"{INFLUX_URL}/query", params=params, timeout=10)
        data = response.json()
        
        output = []
        if 'results' in data and data['results'][0].get('series'):
            series = data['results'][0]['series'][0]
            columns = series['columns']
            values = series['values']
            
            time_idx = columns.index('time')
            sc_idx = columns.index('session_count')
            as_idx = columns.index('active_sessions')
            
            for row in values:
                output.append({
                    "time": row[time_idx],
                    "session_count": int(row[sc_idx] or 0),
                    "active_sessions": int(row[as_idx] or 0)
                })
        return output
    except Exception as e:
        print(f"Error querying history from VictoriaMetrics/InfluxDB: {e}")
        return []

def get_snapshot_at_time(target_time_iso):
    """Retrieves the full JSON snapshot closest to a specific timestamp using InfluxQL."""
    # VictoriaMetrics/InfluxQL query to get the closest record before or at the target time
    query = f'SELECT sessions_json, long_ops_json, blocking_json FROM "oracle_performance" WHERE time <= \'{target_time_iso}\' AND type = \'workload_snapshot\' ORDER BY time DESC LIMIT 1'
    
    try:
        params = {
            'db': INFLUX_BUCKET,
            'q': query
        }
        response = requests.get(f"{INFLUX_URL}/query", params=params, timeout=10)
        data = response.json()
        
        if 'results' in data and data['results'][0].get('series'):
            series = data['results'][0]['series'][0]
            columns = series['columns']
            row = series['values'][0]
            
            time_idx = columns.index('time')
            s_idx = columns.index('sessions_json')
            l_idx = columns.index('long_ops_json')
            b_idx = columns.index('blocking_json')
            
            return {
                "time": row[time_idx],
                "sessions": json.loads(row[s_idx]) if row[s_idx] else [],
                "long_ops": json.loads(row[l_idx]) if row[l_idx] else [],
                "blocking": json.loads(row[b_idx]) if row[b_idx] else []
            }
        return None
    except Exception as e:
        print(f"Error querying snapshot from VictoriaMetrics/InfluxDB: {e}")
        return None
