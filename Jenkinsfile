
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
                    set -e

                    docker --version
                    docker compose version
                    docker info > /dev/null
                '''
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    set -e

                    test -f "$DEPLOY_DIR/.env" || {
                        echo "Deployment .env file missing"
                        exit 1
                    }

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        config --quiet
                '''
            }
        }

        stage('Sync Deployment Directory') {
            steps {
                sh '''
                    set -e

                    cd "$DEPLOY_DIR"

                    test -z "$(git status --porcelain)" || {
                        echo "Deployment directory has local changes"
                        exit 1
                    }

                    git fetch origin main
                    git merge --ff-only "$GIT_COMMIT"
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        build
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

                        export DOCKER_CONFIG="$(mktemp -d)"
                        trap 'rm -rf "$DOCKER_CONFIG"' EXIT

                        cd "$DEPLOY_DIR"

                        # Login to Docker Hub
                        printf '%s' "$DOCKER_TOKEN" |
                            docker login \
                                -u "$DOCKER_USER" \
                                --password-stdin

                        # Tag frontend image
                        docker tag taskmanager-client:latest \
                            "$DOCKER_USER/taskmanager-client:latest"

                        # Tag backend image
                        docker tag taskmanager-server:latest \
                            "$DOCKER_USER/taskmanager-server:latest"

                        # Push frontend image
                        docker push \
                            "$DOCKER_USER/taskmanager-client:latest"

                        # Push backend image
                        docker push \
                            "$DOCKER_USER/taskmanager-server:latest"

                        echo "Docker images pushed successfully!"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -e

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        up -d --no-build
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    cd "$DEPLOY_DIR"

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        ps

                    docker compose \
                        --env-file "$DEPLOY_DIR/.env" \
                        ps --status running
                '''
            }
        }
    }

    post {
        success {
            echo 'Task Manager CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Task Manager pipeline failed. Check Jenkins console output.'
        }
    }
}
