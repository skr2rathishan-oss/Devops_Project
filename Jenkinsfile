
pipeline {
    agent { label 'rootless-user-agent' }

    options {
        skipDefaultCheckout(true)
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
                sh 'docker info > /dev/null'
                sh 'docker compose version'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -e
                    cd "$DEPLOY_DIR"

                    test -z "$(git status --porcelain)"

                    git fetch origin main
                    git merge --ff-only "$GIT_COMMIT"

                    docker compose up -d --build
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
            echo 'Task Manager pipeline completed!'
        }
        failure {
            echo 'Task Manager pipeline failed.'
        }
    }
}
