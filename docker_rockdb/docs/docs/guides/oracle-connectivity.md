# Oracle Connectivity Guide

Connecting to Oracle databases from within a Docker container requires specific networking configurations, especially when the database is hosted outside the container network.

## The `host.docker.internal` Hostname

In the RockDB Docker stack, we have configured the `rockdb-app` service with `extra_hosts` to allow it to resolve `host.docker.internal`.

### How to Connect

When adding a new database connection in the RockDB UI:

1. **Hostname**: Use `host.docker.internal` instead of `localhost` or `127.0.0.1`.
2. **Port**: Use the listener port of your Oracle database (e.g., `1521`).
3. **Service Name/SID**: Provide the correct service name (e.g., `freepdb1`).

### Why this is necessary

By default, `localhost` inside a Docker container refers to the container itself. By using `host.docker.internal`, the container can communicate with services running on your Mac/Windows host machine.

:::tip Firewall Note
Ensure that your host's firewall allows incoming connections on the Oracle listener port from the Docker network range.
:::
