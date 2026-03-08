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
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                usernameVariable: 'USER',
                passwordVariable: 'PASS')]) {
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
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2key',
                keyFileVariable: 'KEYFILE')]) {

                    bat """
                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker pull drkpn5848/fastapi-backend:latest
                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker pull drkpn5848/react-frontend:latest

                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker stop backend
                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker stop frontend

                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker rm backend
                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker rm frontend

                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker run -d -p 8000:8000 --name backend drkpn5848/fastapi-backend:latest
                    ssh -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i %KEYFILE% ec2-user@43.204.24.75 docker run -d -p 80:80 --name frontend drkpn5848/react-frontend:latest
                    """
                }
            }
        }
    }
}