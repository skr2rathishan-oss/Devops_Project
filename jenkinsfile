
pipeline {
    agent { label 'rootless-docker' }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Docker') {
            steps {
                sh '''
                    docker context show
                    docker info > /dev/null
                    docker run --rm node:22-alpine node --version
                '''
            }
        }

        stage('Frontend Build') {
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
                    docker build -t taskmanager-client:ci ./client
                    docker build -t taskmanager-server:ci ./server
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
    }
}
