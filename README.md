eval $(minikube docker-env)

helm install crypto-alert-kafka bitnami/kafka -n kafka --create-namespace -f k8s/kafka/values.yaml

docker build --no-cache -t user-api -f user-api/Dockerfile .
docker build --no-cache -t crypto-api -f crypto-api/Dockerfile .
docker build --no-cache -t alert-api -f alert-api/Dockerfile .
docker build --no-cache -t notification-api -f notification-api/Dockerfile .


kubectl delete deployment user-api
kubectl delete deployment crypto-api
kubectl delete deployment alert-api
kubectl delete deployment notification-api



kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/user-api-deployment.yaml
kubectl apply -f k8s/crypto-api-deployment.yaml
kubectl apply -f k8s/alert-api-deployment.yaml
kubectl apply -f k8s/notification-api-deployment.yaml


kubectl rollout restart deployment/user-api
kubectl rollout restart deployment/crypto-api
kubectl rollout restart deployment/alert-api
kubectl rollout restart deployment/notification-api




minikube service user-api-service --url


