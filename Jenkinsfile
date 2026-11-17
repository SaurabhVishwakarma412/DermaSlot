
pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'saurabhkv/dermaslot-backend'
        FRONTEND_IMAGE = 'saurabhkv/dermaslot-frontend'
        APP_SERVER = 'ubuntu@172.31.6.84'
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
                        --build-arg VITE_API_URL= \
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

        stage('Deploy to Application EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'app-ec2-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -i "$SSH_KEY" \
                            -o StrictHostKeyChecking=accept-new \
                            "$SSH_USER@172.31.6.84" \
                            "cd /opt/dermaslot && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --remove-orphans && docker compose -f docker-compose.prod.yml ps"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'DermaSlot CI/CD Pipeline and Deployment Successful!'
        }

        failure {
            echo 'Pipeline Failed! Check Console Output.'
        }
    }
}
