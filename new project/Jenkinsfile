pipeline {
  agent any
  environment {
    REGISTRY = "registry.example.com/myteam"
    IMAGE = "myapp:${env.BUILD_NUMBER}"
    FULL_IMAGE = "${env.REGISTRY}/${env.IMAGE}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build') {
      steps {
        sh 'docker build -t "${FULL_IMAGE}" .'
      }
    }
    stage('Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'registry-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]){
          sh 'echo $PASS | docker login registry.example.com -u $USER --password-stdin'
          sh 'docker push "${FULL_IMAGE}"'
        }
      }
    }
    stage('Deploy') {
      steps {
        // Example: update k8s deployment
        sh 'kubectl set image deployment/myapp myapp="${FULL_IMAGE}" --record'
      }
    }
  }
  post {
    success { echo 'Pipeline finished — deployment triggered.' }
    failure { echo 'Pipeline failed — check logs.' }
  }
}
