
pipeline {
    agent {
        label 'rootless-user-agent'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        DEPLOY_DIR = '/home/user/taskmanagement/Devops_Project'
        DOCKER_HOST = 'unix:///run/user/1001/docker.sock'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Docker') {
            steps {
                sh '''
                    set -eu

                    echo "Checking Jenkins user..."
                    whoami
                    id

                    echo "Checking rootless Docker socket..."
                    echo "$DOCKER_HOST"
                    test -S /run/user/1001/docker.sock

                    docker --version
                    docker compose version
                    docker info > /dev/null

                    echo "Docker connection successful"
                '''
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    set -eu

                    test -f "$DEPLOY_DIR/.env" || {
                        echo "Deployment .env file missing"
                        exit 1
                    }

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        config --quiet

                    echo "Environment verified"
                '''
            }
        }

        stage('Sync Deployment Directory') {
            steps {
                sh '''
                    set -eu

                    cd "$DEPLOY_DIR"

                    test -z "$(git status --porcelain)" || {
                        echo "Deployment directory has local changes"
                        exit 1
                    }

                    git fetch origin main
                    git merge --ff-only "$GIT_COMMIT"

                    echo "Deployment directory synchronized"
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        build client server

                    echo "Docker images built successfully"
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-hub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        cd "$DEPLOY_DIR"

                        # Use an isolated Docker authentication config
                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        # Log in to Docker Hub
                        printf '%s' "$DOCKER_TOKEN" |
                            docker login \
                                -u "$DOCKER_USER" \
                                --password-stdin

                        # Tag frontend image
                        docker tag \
                            taskmanager-client:latest \
                            "$DOCKER_USER/taskmanager-client:latest"

                        # Tag backend image
                        docker tag \
                            taskmanager-server:latest \
                            "$DOCKER_USER/taskmanager-server:latest"

                        # Push frontend image
                        docker push \
                            "$DOCKER_USER/taskmanager-client:latest"

                        # Push backend image
                        docker push \
                            "$DOCKER_USER/taskmanager-server:latest"

                        echo "Docker Hub images pushed successfully"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        up -d --no-build

                    echo "Deployment completed"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -eu

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        ps

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        ps --status running

                    echo "Deployment verification completed"
                '''
            }
        }
    }

    post {
        success {
            echo 'Task Manager CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Task Manager CI/CD pipeline failed. Check Jenkins console output.'
        }
    }
}
