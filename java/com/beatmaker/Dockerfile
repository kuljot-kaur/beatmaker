## Multi-stage Dockerfile for CollabMusic Spring Boot application
## Build with Maven then run a lightweight JRE image.

# ---- build stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy only the files needed to build first to leverage layer caching
COPY pom.xml ./
COPY java ./java
COPY resources ./resources

# If you have other files (like .mvn or settings) copy them too
COPY .mvn .mvn || true
COPY mvnw mvnw || true

# Build artifact. By default skip tests to make iterative builds faster.
ARG SKIP_TESTS=true
RUN mvn -B -DskipTests=${SKIP_TESTS} package

# ---- runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# The jar name is defined in pom.xml (artifactId + version)
ARG JAR_FILE=target/collabmusic-0.0.1-SNAPSHOT.jar
COPY --from=build /workspace/${JAR_FILE} ./app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Optional: tune memory via JAVA_OPTS
ENV JAVA_OPTS="-Xms128m -Xmx512m"

# Note: no HEALTHCHECK here to keep the runtime image minimal. If you enable
# Spring Boot Actuator in your app and want Docker health checks, add a check
# that uses curl/wget or the built-in CMD-SHELL calling java to probe /actuator/health.

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
