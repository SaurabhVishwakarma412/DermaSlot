pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "saurabhkv/project-pedo-backend:latest"
        FRONTEND_IMAGE = "saurabhkv/project-pedo-frontend:latest"
    }

    stages {
        stage('Test') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'cd backend && (npm ci || npm install) && npm test'
                    } else {
                        bat 'cd backend && (npm ci || npm install) && npm test'
                    }
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        if (isUnix()) {
                            sh '''
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                docker build -t $BACKEND_IMAGE ./backend
                                docker build -t $FRONTEND_IMAGE ./frontend
                                docker push $BACKEND_IMAGE
                                docker push $FRONTEND_IMAGE
                            '''
                        } else {
                            bat '''
                                echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
                                docker build -t %BACKEND_IMAGE% ./backend
                                docker build -t %FRONTEND_IMAGE% ./frontend
                                docker push %BACKEND_IMAGE%
                                docker push %FRONTEND_IMAGE%
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker-compose pull && docker-compose up -d'
                    } else {
                        bat 'docker-compose pull & docker-compose up -d'
                    }
                }
            }
        }
    }
}
