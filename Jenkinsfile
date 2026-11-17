
pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'saurabhkv/dermaslot-backend'
        FRONTEND_IMAGE = 'saurabhkv/dermaslot-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test --if-present'
                }
            }
        }

        stage('Frontend Test') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm test --if-present'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t $BACKEND_IMAGE:latest ./backend

                    docker build \
                    --build-arg VITE_API_URL=/api \
                    --build-arg VITE_SOCKET_URL= \
                    -t $FRONTEND_IMAGE:latest ./frontend
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                        -u "$DOCKER_USER" --password-stdin

                        docker push $BACKEND_IMAGE:latest
                        docker push $FRONTEND_IMAGE:latest

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'DermaSlot CI/CD Pipeline Successful!'
        }

        failure {
            echo 'Pipeline Failed! Check Console Output.'
        }
    }
}
