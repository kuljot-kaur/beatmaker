# collabmusic

This repository contains a small collaborative beat maker app: a Spring Boot backend and a simple frontend served from the backend's static resources. The frontend uses SockJS + STOMP to send/receive beat patterns in realtime.

This README merges the frontend instructions and integration notes and adds Docker support.

Requirements
- Java 17+ (JDK) to build the backend
- Maven (or use the provided Dockerfile)
- Node.js + npm (for the optional STOMP integration test)

Quick start - build & run locally

1. Build and run tests:

```powershell
cd D:\vscode\colabmusic\collabmusic
mvn test
```

2. Run the app locally:

```powershell
cd D:\vscode\colabmusic\collabmusic
mvn spring-boot:run
```

3. Open the frontend in a browser:

- http://localhost:8080
- Open two tabs to test realtime updates between clients.

Frontend testing and integration

Manual frontend (browser) test

1. Start the backend:

```powershell
cd d:\vscode\colabmusic\collabmusic
mvn spring-boot:run
```

2. Open a browser and navigate to:

   http://localhost:8080

   - Click grid cells to toggle beats, and click Play to hear a click tone.
   - Open Developer Tools (F12) → Network / WebSockets to inspect frames.

3. Verify websocket

   - The frontend connects to `/ws` via SockJS then STOMP.
   - It subscribes to `/topic/beats` and sends to `/app/beat`.

Automated STOMP integration test (Node)

Prerequisites:

- Node.js installed (v14+ recommended)

Steps:

```powershell
cd d:\vscode\colabmusic\collabmusic\integration
npm install
npm run test-stomp
```

What it does:

- Connects to `http://localhost:8080/ws` using SockJS + STOMP.
- Subscribes to `/topic/beats` and publishes a small test payload to `/app/beat`.
- Passes if a message is received on `/topic/beats` within 3s.

If the test fails:

- Ensure the backend is running on port 8080.
- Check CORS/allowed origins (the server currently sets allowed origins to `*` for SockJS).

Automated STOMP integration test (optional)

Prerequisites: Node 14+ installed

```powershell
cd D:\vscode\colabmusic\collabmusic\integration
npm install
npm run test-stomp
```

This connects to the running backend at `http://localhost:8080/ws`, publishes a small test pattern, and verifies a message is received on `/topic/beats`.

Docker

I added a multi-stage Dockerfile that builds the Spring Boot app with Maven and packages it into a lightweight JVM image.

Build the image (from repo root where `pom.xml` is located):

```powershell
cd D:\vscode\colabmusic\collabmusic
docker build -f java/com/beatmaker/Dockerfile -t collabmusic:latest .
```

Run the container:

```powershell
docker run --rm -p 8080:8080 --name collabmusic collabmusic:latest
```

Notes about the Dockerfile
- It uses Maven (Eclipse Temurin 17) in the build stage to create the fat jar and a JRE image to run the jar.
- The default Spring Boot port 8080 is exposed.
- The `HEALTHCHECK` uses the actuator health endpoint — if your app doesn't enable actuator, the healthcheck may fail; remove or adjust it in the Dockerfile.

Render / PaaS Docker notes
--------------------------------
- Render and many PaaS providers set a dynamic `PORT` environment variable for your service. The provided Dockerfile respects the `PORT` env var at runtime and passes it to Spring Boot (`-Dserver.port=${PORT}`).
- To deploy on Render using a Docker image:
   1. Create a new "Web Service" on Render and select the Docker deployment option.
 2. Set the build context to the repository root and the Dockerfile path to `java/com/beatmaker/Dockerfile`.
 3. Ensure the service has the environment variable `PORT` (Render sets this for you automatically).
 4. If you want more memory for the JVM, add `JAVA_OPTS` env var (for example `-Xms256m -Xmx1g`).

Example Render settings:

   - Build Command: (leave default; Dockerfile builds the app)
   - Start Command: (leave empty; Dockerfile ENTRYPOINT handles startup)
   - Environment: leave `PORT` blank (Render will populate it)

If you prefer Render's native build (no Docker), you can set up a `render.yaml` file — tell me if you want that and I will add it.

Troubleshooting
- If the frontend can't connect to WebSocket:
	- Ensure backend is running and reachable on port 8080.
	- Check server logs (mvn spring-boot:run output) for websocket exceptions.
- If Node integration test fails:
	- Ensure backend is running first.
	- Run `npm install` inside the `integration` folder, not at repo root.
If you need reproducible Maven builds in CI, consider adding the Maven Wrapper (`mvnw`) to the repo.

Maven Wrapper note
------------------
I added `mvnw`, `mvnw.cmd` and `.mvn/wrapper/maven-wrapper.properties` to the repo. The actual
binary `maven-wrapper.jar` is not included. To generate it locally (and commit it) run:

```powershell
mvn -N io.takari:maven:wrapper
```

That will populate `.mvn/wrapper/maven-wrapper.jar`. Committing the jar makes CI and Render
builds reproducible without preinstalled Maven.

Next steps (optional improvements)

If you want any of the above, tell me which and I will implement it.
