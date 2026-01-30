from .utils import get_db_connection, encrypt_password, decrypt_password

def get_all_connections():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM connections")
    rows = cursor.fetchall()
    conn.close()
    
    connections = []
    for row in rows:
        d = dict(row)
        d['password'] = '••••••••' # Mask password
        connections.append(d)
    return connections

def get_active_connection():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM connections WHERE is_active = 1")
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def save_connection(data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    password = encrypt_password(data['password'])
    
    sql = """INSERT INTO connections (name, host, port, service, username, password, type) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"""
    params = (data['name'], data['host'], data['port'], data['service'], 
              data['username'], password, data['type'])
    
    cursor.execute(sql, params)
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return last_id

def update_connection(conn_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    fields = ["name", "host", "port", "service", "username", "type"]
    params = [data[f] for f in fields]
    
    sql = "UPDATE connections SET " + ", ".join([f"{f}=?" for f in fields])
    
    if 'password' in data and data['password'] != '••••••••':
        sql += ", password=?"
        params.append(encrypt_password(data['password']))
        
    sql += " WHERE id=?"
    params.append(conn_id)
    
    cursor.execute(sql, params)
    conn.commit()
    conn.close()

def delete_connection(conn_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM connections WHERE id = ?", (conn_id,))
    conn.commit()
    conn.close()

def activate_connection(conn_id, discovery_data=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE connections SET is_active = 0")
    
    if discovery_data:
        sql = """UPDATE connections SET is_active=1, last_connected=CURRENT_TIMESTAMP,
                 version=?, patch=?, os=?, db_type=?, role=?, apply_status=?, 
                 log_mode=?, is_rac=?, inst_name=?
                 WHERE id=?"""
        params = (
            discovery_data.get('version'),
            discovery_data.get('patch'),
            discovery_data.get('os'),
            discovery_data.get('db_type'),
            discovery_data.get('role'),
            discovery_data.get('apply_status'),
            discovery_data.get('log_mode'),
            discovery_data.get('is_rac'),
            discovery_data.get('inst_name'),
            conn_id
        )
        cursor.execute(sql, params)
    else:
        cursor.execute("UPDATE connections SET is_active = 1, last_connected = CURRENT_TIMESTAMP WHERE id = ?", (conn_id,))
        
    conn.commit()
    conn.close()
