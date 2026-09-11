# Stage 1 — build the jar
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Download deps first (cached layer — only re-runs if pom.xml changes)
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2 — minimal runtime image (non-root user)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/target/pizzamaker-api-1.0.0.jar app.jar
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=45s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Startup-tuned for a cold start on a throttled free-tier CPU, where the wake
# time a visitor waits on is dominated by JVM warm-up, not steady-state
# throughput. TieredStopAtLevel=1 stops at the C1 JIT so it stops burning
# startup CPU on optimising code that runs a handful of times; SerialGC skips
# the multi-threaded GC setup that a 512MB single-core box can't use anyway;
# Xshare:auto maps the shared class archive instead of reloading core classes.
ENTRYPOINT ["java", "-XX:TieredStopAtLevel=1", "-XX:+UseSerialGC", "-Xshare:auto", "-jar", "app.jar"]
