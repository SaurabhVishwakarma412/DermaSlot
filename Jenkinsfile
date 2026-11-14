
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        BACKEND_IMAGE = 'saurabhkv/project-pedo-backend'
        FRONTEND_IMAGE = 'saurabhkv/project-pedo-frontend'

        EC2_HOST = 'YOUR_EC2_PUBLIC_IP'
        EC2_USER = 'ubuntu'
        DEPLOY_DIR = '/opt/pedoderma'

        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        // 1. Get source code from DermaSlot
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 2. Test backend
        stage('Backend Test') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                    bat 'npm test --if-present'
                }
            }
        }

        // 3. Test and build frontend
        stage('Frontend Test') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                    bat 'npm test --if-present'
                    bat 'npm run build'
                }
            }
        }

        // 4. Build Docker images
        stage('Docker Build') {
            steps {
                bat '''
                    docker build -t %BACKEND_IMAGE%:%IMAGE_TAG% -t %BACKEND_IMAGE%:latest ./backend

                    docker build --build-arg VITE_API_URL=/api --build-arg VITE_SOCKET_URL= -t %FRONTEND_IMAGE%:%IMAGE_TAG% -t %FRONTEND_IMAGE%:latest ./frontend
                '''
            }
        }

        // 5. Push images to Docker Hub
        stage('Docker Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DH_USER',
                        passwordVariable: 'DH_PASS'
                    )
                ]) {
                    bat '''
                        @echo off

                        echo %DH_PASS% | docker login -u %DH_USER% --password-stdin

                        docker push %BACKEND_IMAGE%:%IMAGE_TAG%
                        docker push %BACKEND_IMAGE%:latest

                        docker push %FRONTEND_IMAGE%:%IMAGE_TAG%
                        docker push %FRONTEND_IMAGE%:latest

                        docker logout
                    '''
                }
            }
        }

        // 6. Deploy to AWS EC2
        stage('Deploy to AWS') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'ec2-key-file',
                        variable: 'SSH_KEY'
                    )
                ]) {
                    bat '''
                        scp -i "%SSH_KEY%" docker-compose.prod.yml prometheus.yml %EC2_USER%@%EC2_HOST%:%DEPLOY_DIR%/

                        ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "cd %DEPLOY_DIR% && export IMAGE_TAG=%IMAGE_TAG% && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --remove-orphans"
                    '''
                }
            }
        }

        // 7. Verify deployment
        stage('Verify Deployment') {
            steps {
                withCredentials([
                    file(
                        credentialsId: 'ec2-key-file',
                        variable: 'SSH_KEY'
                    )
                ]) {
                    bat '''
                        ssh -i "%SSH_KEY%" %EC2_USER%@%EC2_HOST% "docker compose -f %DEPLOY_DIR%/docker-compose.prod.yml ps"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'DermaSlot CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins Console Output.'
        }

        always {
            echo 'Pipeline execution finished.'
        }
    }
}