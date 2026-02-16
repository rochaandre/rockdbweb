FROM grafana/grafana:latest

# Switch to root to install plugins and set up directories
USER root

# Install required plugins
RUN grafana-cli plugins install grafana-clock-panel
RUN grafana-cli plugins install grafana-simple-json-datasource

# Copy provisioning configurations
COPY datasources /etc/grafana/provisioning/datasources
COPY dashboard.yaml /etc/grafana/provisioning/dashboards/main.yaml
COPY dashboards /var/lib/grafana/dashboards

# Ensure correct permissions
RUN chown -R 472:472 /etc/grafana/provisioning /var/lib/grafana/dashboards

# Switch back to grafana user
USER grafana

# Default entrypoint from base image is fine
# We'll use the environment variables in docker-compose for the admin password reset if needed
