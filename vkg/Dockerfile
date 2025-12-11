FROM ontop/ontop:5.4.0

# Copy Oracle JDBC driver
COPY jdbc/ojdbc8-21.11.0.0.jar /opt/ontop/jdbc/

# Copy input files (ontology, mappings, properties)
COPY input/ /opt/ontop/input/

# Set environment variables for file paths
ENV ONTOP_ONTOLOGY_FILE=/opt/ontop/input/ontology.ttl
ENV ONTOP_MAPPING_FILE=/opt/ontop/input/mappings.ttl
ENV ONTOP_PROPERTIES_FILE=/opt/ontop/input/ontop.properties
ENV ONTOP_CORS_ALLOWED_ORIGINS="*"
ENV ONTOP_LAZY_INIT="true"
ENV ONTOP_DEV_MODE="false"

# Expose SPARQL endpoint port
EXPOSE 8080
