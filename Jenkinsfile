
pipeline {
    agent { label 'rootless-docker' }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Rootless Docker') {
            steps {
                sh '''
                    echo "Checking Jenkins agent..."
                    whoami
                    echo "Docker context:"
                    docker context show
                    echo "Docker information:"
                    docker info
                    echo "Checking Node.js container..."
                    docker run --rm node:22-alpine node --version
                '''
            }
        }

        stage('Frontend Build and Test') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$WORKSPACE:/app" \
                      -w /app/client \
                      node:22-alpine sh -c \
                      "npm ci && npm run lint && npm run build"
                '''
            }
        }

        stage('Backend Validation') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$WORKSPACE:/app" \
                      -w /app/server \
                      node:22-alpine sh -c \
                      "npm ci && node --check server.js"
                '''
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    echo "Building frontend Docker image..."
                    docker build -t taskmanager-client:ci ./client

                    echo "Building backend Docker image..."
                    docker build -t taskmanager-server:ci ./server
                '''
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh '''
                    docker image inspect taskmanager-client:ci > /dev/null
                    docker image inspect taskmanager-server:ci > /dev/null

                    echo "Both Docker images built successfully!"
                '''
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline SUCCESS!'
        }

        failure {
            echo 'CI Pipeline FAILED!'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
