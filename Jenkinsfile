
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
                    docker --version
                    docker compose version
                    docker info > /dev/null
                '''
            }
        }

        stage('Verify Environment') {
            steps {
                sh '''
                    test -f "$DEPLOY_DIR/.env" || {
                        echo "Deployment .env file missing"
                        exit 1
                    }

                    docker compose \
                      --project-directory "$DEPLOY_DIR" \
                      --env-file "$DEPLOY_DIR/.env" \
                      -f docker-compose.yml \
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
                    cd "$DEPLOY_DIR"
                    docker compose build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    cd "$DEPLOY_DIR"
                    docker compose up -d
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    cd "$DEPLOY_DIR"
                    docker compose ps
                '''
            }
        }
    }

    post {
        success {
            echo 'Task Manager pipeline completed successfully!'
        }

        failure {
            echo 'Task Manager pipeline failed. Check console output.'
        }
    }
}
