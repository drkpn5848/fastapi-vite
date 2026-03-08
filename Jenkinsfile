pipeline {
    agent any

    environment {
        DOCKER_USER = "drkpn5848"
        IMAGE = "${DOCKER_USER}/fastapi-react-app"
        EC2_IP = "43.204.24.75"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/drkpn5848/fastapi-vite.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE%:latest .'
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

        stage('Push Docker Image') {
            steps {
                bat 'docker push %IMAGE%:latest'
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2key']) {
                    bat """
                    ssh ec2-user@%EC2_IP% docker pull %IMAGE%:latest
                    ssh ec2-user@%EC2_IP% docker stop app || true
                    ssh ec2-user@%EC2_IP% docker rm app || true
                    ssh ec2-user@%EC2_IP% docker run -d -p 80:80 --name app %IMAGE%:latest
                    """
                }
            }
        }

    }
}