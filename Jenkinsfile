pipeline {
    agent any

    environment {
        DOCKER_USER = "drkpn5848"
        BACKEND_IMAGE = "${DOCKER_USER}/fastapi-backend"
        FRONTEND_IMAGE = "${DOCKER_USER}/react-frontend"
        EC2_IP = "43.204.24.75"
    }

    stages {

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t %BACKEND_IMAGE%:latest .'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat 'docker build -t %FRONTEND_IMAGE%:latest .'
                }
            }
        }

        stage('Login DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat 'echo %PASS% | docker login -u %USER% --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                bat 'docker push %BACKEND_IMAGE%:latest'
                bat 'docker push %FRONTEND_IMAGE%:latest'
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-key',
                    keyFileVariable: 'KEYFILE'
                )]) {

                    bat """
                    copy %KEYFILE% C:\\jenkins_key.pem

                    icacls C:\\jenkins_key.pem /inheritance:r
                    icacls C:\\jenkins_key.pem /grant:r SYSTEM:R
                    icacls C:\\jenkins_key.pem /grant:r Administrators:R

                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker pull %BACKEND_IMAGE%:latest
                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker pull %FRONTEND_IMAGE%:latest

                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker stop backend  true
                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker stop frontend  true

                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker rm backend  true
                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker rm frontend  true

                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker run -d -p 8000:8000 --name backend %BACKEND_IMAGE%:latest
                    ssh -o StrictHostKeyChecking=no -i C:\\jenkins_key.pem ec2-user@%EC2_IP% docker run -d -p 80:80 --name frontend %FRONTEND_IMAGE%:latest
                    """
                }
            }
        }
    }
}