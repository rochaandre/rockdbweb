# Monitoring Automation Flow

RockDB uses a combination of **Ansible** and **Jenkins** to ensure that all registered servers have the monitoring agent (`node_exporter`) installed and running.

## Architectural Components

### 1. Ansible Inventory Synchronization
Every time a server is added, updated, or removed in the **Servers Management** screen, the backend (`ansible_sync_mod.py`) automatically regenerates the Ansible `inventory.ini` file located in the shared monitoring volume.
- Servers are grouped by their environment type (e.g., `PROD`, `DEV`, `TEST`).

### 2. Jenkins Health Checks
A dedicated Jenkins service (`rockdb-jenkins`) runs a daily pipeline to verify the health of the monitoring fleet.

- **Check Stage**: Jenkins runs an Ansible command to check if the `node_exporter` service is active on all hosts in the inventory.
- **Auto-Remediation Stage**: If any host is found without the agent or if the service is stopped, Jenkins triggers an Ansible playbook to install and start the agent automatically.

### 3. Ansible Playbooks
The playbooks are located in `monitoring/ansible/playbooks/` and support the following operations:
- `install`: Creates the user, downloads the binary, sets up the systemd service, and starts the agent.
- `remove`: Stops the service and removes all binary/configuration files.
- `check`: Verifies if the service is active.

## How to Trigger Manually
You can manually trigger a full agent deployment to all servers by running the following command inside the `rockdb_jenkins` container:

```bash
ansible-playbook -i /app/monitoring/ansible/inventory.ini /app/monitoring/ansible/playbooks/manage_agent.yml --tags install
```

## Security Note
Ansible uses the SSH keys configured for each server in RockDB. These keys are used by Jenkins to establish secure connections during health checks and deployments.
