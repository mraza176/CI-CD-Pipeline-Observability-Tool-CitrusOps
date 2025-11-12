# Pipeline Observability Application

This application provides observability for GitLab CI/CD pipelines, displaying pipeline details, jobs, and test results.

## Starting the GitLab Server

To start the GitLab server for development and testing:

### Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB of available RAM

### Starting GitLab

1. Pull the GitLab Docker image:
   ```bash
   docker pull gitlab/gitlab-ce:latest
   ```

2. Create a `docker-compose.yml` file with the following content:
   ```yaml
   version: '3'
   services:
     gitlab:
       image: 'gitlab/gitlab-ce:latest'
       restart: always
       hostname: 'localhost'
       environment:
         GITLAB_OMNIBUS_CONFIG: |
           external_url 'http://localhost'
           gitlab_rails['gitlab_shell_ssh_port'] = 2222
       ports:
         - '8080:80'
         - '2222:22'
       volumes:
         - 'gitlab-config:/etc/gitlab'
         - 'gitlab-logs:/var/log/gitlab'
         - 'gitlab-data:/var/opt/gitlab'
       shm_size: '256m'

   volumes:
     gitlab-config:
     gitlab-logs:
     gitlab-data:
   ```

3. Start GitLab using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Wait for GitLab to initialize (this may take a few minutes). You can check the logs with:
   ```bash
   docker-compose logs -f
   ```

5. Once started, access GitLab at: http://localhost:8080

### Initial Setup

1. The first time you access GitLab, you'll be prompted to set a password for the root user
2. After setting the password, log in with:
   - Username: `root`
   - Password: (the password you set)

### Creating a Test Project with CI/CD

1. Create a new project in GitLab
2. Add a `.gitlab-ci.yml` file to your project with the following content to enable test reporting:

```yaml
stages:
  - test
  - deploy

test_job:
  stage: test
  image: node:16
  before_script:
    - npm init -y
    - npm install --save-dev jest jest-junit
  script:
    - mkdir -p tests
    - mkdir -p test-results
    
    # Create test files
    - >
      echo 'describe("Math operations", () => {
        test("addition should work", () => {
          expect(1 + 1).toBe(2);
        });
        test("subtraction should work", () => {
          expect(5 - 2).toBe(3);
        });
        test("multiplication should work", () => {
          expect(3 * 4).toBe(12);
        });
        test("division should work", () => {
          expect(10 / 2).toBe(5);
        });
        test("modulo should work", () => {
          expect(10 % 3).toBe(1);
        });
      });' > tests/math.test.js
      
    - >
      echo 'describe("String operations", () => {
        test("should concatenate strings", () => {
          expect("hello" + " world").toBe("hello world");
        });
        test("should check string length", () => {
          expect("testing".length).toBe(7);
        });
        test("should convert to uppercase", () => {
          expect("hello".toUpperCase()).toBe("HELLO");
        });
        test("should convert to lowercase", () => {
          expect("WORLD".toLowerCase()).toBe("world");
        });
        test("should include substring", () => {
          expect("hello world").toContain("world");
        });
      });' > tests/string.test.js

    - >
      echo 'describe("Array operations", () => {
        test("should push items to array", () => {
          const arr = [1, 2, 3];
          arr.push(4);
          expect(arr).toEqual([1, 2, 3, 4]);
        });
        test("should find array length", () => {
          expect([1, 2, 3, 4, 5].length).toBe(5);
        });
        test("should filter array", () => {
          const numbers = [1, 2, 3, 4, 5];
          const evens = numbers.filter(n => n % 2 === 0);
          expect(evens).toEqual([2, 4]);
        });
        test("should map array", () => {
          const numbers = [1, 2, 3];
          const doubled = numbers.map(n => n * 2);
          expect(doubled).toEqual([2, 4, 6]);
        });
      });' > tests/array.test.js
    
    # Configure Jest with proper JUnit reporting
    - >
      echo '{
        "name": "gitlab-ci-tests",
        "version": "1.0.0",
        "scripts": {
          "test": "jest --ci --testResultsProcessor=jest-junit"
        },
        "jest": {
          "testEnvironment": "node",
          "collectCoverage": true,
          "coverageReporters": ["text", "lcov", "html"],
          "testResultsProcessor": "jest-junit"
        },
        "jest-junit": {
          "outputDirectory": "test-results",
          "outputName": "junit.xml",
          "classNameTemplate": "{classname}",
          "titleTemplate": "{title}",
          "ancestorSeparator": " › ",
          "usePathForSuiteName": true,
          "addFileAttribute": true,
          "suiteNameTemplate": "{filename}",
          "includeConsoleOutput": true
        }
      }' > package.json
    
    # Run tests with proper Jest configuration
    - echo "Running Jest tests..."
    - npm test
    - echo "Test execution completed"
    - ls -la test-results/
    - echo "JUnit XML content:"
    - cat test-results/junit.xml
    
  artifacts:
    when: always
    reports:
      junit:
        - test-results/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    paths:
      - test-results/
      - coverage/
    expire_in: 1 week

deploy:
  stage: deploy
  script:
    - echo "Deployment simulation"
  environment: production
```

### Stopping GitLab

To stop the GitLab server:
```bash
docker-compose down
```

To completely remove GitLab including all data:
```bash
docker-compose down -v
```

## Starting the GitLab Web App Server

To start the GitLab web application server for development:

```bash
cd GitLab/GitLab-Web-App && go run server.go
```

This will start the GitLab web application server that handles the integration between the Pipeline Observability Application and your GitLab instance.

## Connecting to GitLab from the Pipeline Observability Application

1. Ensure the GitLab server is running
2. Configure the application to connect to your GitLab instance at http://localhost:8080
3. Use a personal access token with API permissions for authentication

## Troubleshooting

- If GitLab is slow to start, ensure your system has enough resources allocated to Docker
- Check Docker logs for specific error messages if GitLab fails to start
- Ensure ports 8080 and 2222 are not being used by other applications