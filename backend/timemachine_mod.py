import os
import time
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
query_api = client.query_api()

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
    """Retrieves high-level metrics for a time range to populate a timeline."""
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: {start_time_iso}, stop: {end_time_iso})
      |> filter(fn: (r) => r["_measurement"] == "oracle_performance")
      |> filter(fn: (r) => r["_field"] == "session_count" or r["_field"] == "active_sessions")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> keep(columns: ["_time", "session_count", "active_sessions"])
    '''
    try:
        result = query_api.query(org=INFLUX_ORG, query=query)
        output = []
        for table in result:
            for record in table.records:
                output.append({
                    "time": record.get_time().isoformat(),
                    "session_count": record["session_count"],
                    "active_sessions": record["active_sessions"]
                })
        return output
    except Exception as e:
        print(f"Error querying history from InfluxDB: {e}")
        return []

def get_snapshot_at_time(target_time_iso):
    """Retrieves the full JSON snapshot closest to a specific timestamp."""
    # We query the point closest to the target time
    query = f'''
    from(bucket: "{INFLUX_BUCKET}")
      |> range(start: -30d) 
      |> filter(fn: (r) => r["_measurement"] == "oracle_performance")
      |> filter(fn: (r) => r["_time"] <= {target_time_iso})
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: 1)
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    '''
    try:
        result = query_api.query(org=INFLUX_ORG, query=query)
        if not result:
            return None
            
        for table in result:
            for record in table.records:
                return {
                    "time": record.get_time().isoformat(),
                    "sessions": json.loads(record["sessions_json"]) if "sessions_json" in record else [],
                    "long_ops": json.loads(record["long_ops_json"]) if "long_ops_json" in record else [],
                    "blocking": json.loads(record["blocking_json"]) if "blocking_json" in record else []
                }
        return None
    except Exception as e:
        print(f"Error querying snapshot from InfluxDB: {e}")
        return None
