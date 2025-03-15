pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-2'  // Change as needed
        AWS_ACCOUNT_ID = '148761684097'
        ECS_SERVICE = 'terra-ecs-service4'   // Single variable for service name
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        NEW_TASK_DEF_ARN = ''

        // We'll reuse ECS_SERVICE for ECR repo, container name, and task family
        ECR_REPO = "${ECS_SERVICE}"
        TASK_DEFINITION_FAMILY = "${ECS_SERVICE}"
        CONTAINER_NAME = "${ECS_SERVICE}"

        ECS_CLUSTER = 'terraform-cluster'
        LOG_GROUP_NAME = "/ecs/${ECS_SERVICE}"  // CloudWatch Log Group

        EXECUTION_ROLE_ARN = "arn:aws:iam::148761684097:role/ecsTaskExecutionRole"
        TASK_ROLE_ARN = "arn:aws:iam::148761684097:role/ecsTaskExecutionRole"
        
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', credentialsId: 'github-token', url: 'https://github.com/aditithakur0006/todo-frontend.git'
            }
        }

       stage('Create ECR Repository') {
    steps {
        script {
            def repoExists = sh(script: """
                aws ecr describe-repositories --repository-names $ECR_REPO --query repositories[0].repositoryName --output text || echo MISSING
            """, returnStdout: true).trim()

            if (repoExists == 'MISSING') {
                echo "Creating ECR Repo: $ECR_REPO"
                sh """
                aws ecr create-repository --repository-name $ECR_REPO --image-scanning-configuration scanOnPush=true --region $AWS_REGION
                """
            } else {
                echo "ECR Repo '$ECR_REPO' already exists."
            }
        }
    }
}


stage('Build and Push Docker Image') {
    steps {
        script {
            echo "Authenticating Docker with ECR..."
            sh """
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
            """

            echo "Building Docker image..."
            sh """
            docker build -t ${ECR_REPO}:${IMAGE_TAG} .
            """

            echo "Tagging Docker image..."
            sh """
            docker tag ${ECR_REPO}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
            """

            echo "Pushing Docker image to ECR..."
            sh """
            docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
            """
        }
    }
}


      stage('Check/Create CloudWatch Log Group') {
    steps {
        script {
            def logGroupExists = sh(script: """
                aws logs describe-log-groups --log-group-name-prefix $LOG_GROUP_NAME --query 'logGroups[*].logGroupName' --output text
            """, returnStdout: true).trim()

            if (logGroupExists) {
                echo "CloudWatch Log Group already exists: $LOG_GROUP_NAME"
            } else {
                echo "Creating CloudWatch Log Group: $LOG_GROUP_NAME"
                sh "aws logs create-log-group --log-group-name $LOG_GROUP_NAME"
            }
        }
    }
}
stage('Register New ECS Task Definition') {
    steps {
        script {
            def taskDefArn = sh(
                script: "aws ecs describe-task-definition --task-definition $TASK_DEFINITION_FAMILY --query 'taskDefinition.taskDefinitionArn' --output text 2>/dev/null || echo ''",
                returnStdout: true
            ).trim()

            if (taskDefArn) {
                echo "Updating existing task definition..."
            } else {
                echo "Creating new task definition..."
            }

            def newTaskDefArn = sh(
                script: """
                aws ecs register-task-definition \
                    --family $TASK_DEFINITION_FAMILY \
                    --network-mode bridge \
                    --requires-compatibilities EC2 \
                    --cpu "512" --memory "1024" \
                    --execution-role-arn "$EXECUTION_ROLE_ARN" \
                    --task-role-arn "$TASK_ROLE_ARN" \
                    --container-definitions '[
                        { 
                            "name": "$ECS_SERVICE",
                            "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECS_SERVICE}:${IMAGE_TAG}",
                            "memory": 1024,
                            "cpu": 512,
                            "essential": true,
                            "portMappings": [
                                {
                                    "containerPort": 80,
                                    "hostPort": 0,
                                    "protocol": "tcp"
                                }
                            ],
                            "logConfiguration": {
                                "logDriver": "awslogs",
                                "options": {
                                    "awslogs-group": "$LOG_GROUP_NAME",
                                    "awslogs-region": "$AWS_REGION",
                                    "awslogs-stream-prefix": "ecs"
                                }
                            }
                        }
                    ]' --query 'taskDefinition.taskDefinitionArn' --output text 2>&1
                """,
                returnStdout: true
            ).trim()

            // Debugging output
            echo "Raw Output of Task Definition Registration: ${newTaskDefArn}"

            if (!newTaskDefArn || newTaskDefArn == "null") {
                error "Failed to register task definition. Check AWS permissions or CLI errors."
            }

            withEnv(["NEW_TASK_DEF_ARN=${newTaskDefArn}"]) {
                echo "New Task Definition ARN: ${env.NEW_TASK_DEF_ARN}"
            }
        }
    }
}
        stage('Check and Create/Update ECS Service') {
    steps {
        script {
            echo "$env.NEW_TASK_DEF_ARN"
            def serviceExists = sh(
                script: "aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --query 'services[0].status' --output text 2>/dev/null || echo 'MISSING'",
                returnStdout: true
            ).trim()

            if (serviceExists == "MISSING") {
                echo "Creating ECS Service..."
                sh """
                aws ecs create-service \
                    --cluster $ECS_CLUSTER \
                    --service-name $ECS_SERVICE \
                    --task-definition ${env.NEW_TASK_DEF_ARN} \
                    --desired-count 1 \
                    --launch-type EC2
                """
            } else {
                echo "Updating ECS Service..."
                sh """
                aws ecs update-service \
                    --cluster $ECS_CLUSTER \
                    --service $ECS_SERVICE \
                    --task-definition ${env.NEW_TASK_DEF_ARN} \
                    --force-new-deployment
                """
            }
        }
    }
}
    }
}
