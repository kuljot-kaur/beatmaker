## Multi-stage Dockerfile for CollabMusic Spring Boot application
## Build with Maven then run a lightweight JRE image.

# ---- build stage ----
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy only the files needed to build first to leverage layer caching
COPY pom.xml ./
COPY java ./java
COPY resources ./resources

# If you have other files (like .mvn or mvnw) you can copy them here.
# Copy the Maven wrapper files so the image can build reproducibly using ./mvnw
# If you want reproducible builds with the Maven Wrapper, add the wrapper files to the repo
# and uncomment the lines below. Docker COPY will fail if the files do not exist in the build context.
# COPY .mvn .mvn
# COPY mvnw mvnw
# RUN if [ -f mvnw ]; then chmod +x mvnw; fi

# Build artifact. By default skip tests to make iterative builds faster.
ARG SKIP_TESTS=true
RUN mvn -B -DskipTests=${SKIP_TESTS} package

# ---- runtime stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# The jar name is defined in pom.xml (artifactId + version)
ARG JAR_FILE=target/collabmusic-0.0.1-SNAPSHOT.jar
COPY --from=build /workspace/${JAR_FILE} ./app.jar

# Expose the default Spring Boot port (documentation only)
EXPOSE 8080

# Optional: tune memory via JAVA_OPTS
ENV JAVA_OPTS="-Xms128m -Xmx512m"

# Use the PORT env var if present (Render and many PaaS set PORT). Default to 8080.
ENV PORT=8080

# Note: no HEALTHCHECK here to keep the runtime image minimal. If you enable
# Spring Boot Actuator in your app and want Docker health checks, add a check
# that uses curl/wget or the built-in CMD-SHELL calling java to probe /actuator/health.

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/app.jar"]
