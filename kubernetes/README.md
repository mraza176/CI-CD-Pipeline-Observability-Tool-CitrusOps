# CitrusOps Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the CitrusOps CI/CD Pipeline Observability Tool.

## Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured to communicate with your cluster
- (Optional) NGINX Ingress Controller for ingress support

## Architecture

The deployment consists of the following components:

### Infrastructure Services

- **MongoDB**: Database for storing application data
- **Redis**: Caching and message broker
- **NATS**: Message streaming platform

### Application Services

- **Client**: Frontend Next.js application (port 3000)
- **Web App**: ArgoCD backend service (port 8080)
- **GitLab Web App**: GitLab integration service (port 8081)
- **Cronjob**: Background monitoring service
- **Notification**: Notification handler service
- **Slack**: Slack integration service
- **Email**: Email notification service

## Deployment Instructions

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Deploy Infrastructure Services

Deploy in order to ensure dependencies are met:

```bash
# Deploy MongoDB with persistent storage
kubectl apply -f mongodb.yaml

# Deploy Redis
kubectl apply -f redis.yaml

# Deploy NATS
kubectl apply -f nats.yaml
```

### 3. Deploy Application Configuration

```bash
kubectl apply -f configmap.yaml
```

### 4. Build and Push Docker Images

Before deploying the application services, you need to build and push the Docker images to your container registry:

```bash
# Build client image
docker build -t <your-registry>/citrusops-client:latest ./app/client
docker push <your-registry>/citrusops-client:latest

# Build web-app image
docker build -t <your-registry>/citrusops-web-app:latest ./app/server/ArgoCD/ArgoCD-Web-App
docker push <your-registry>/citrusops-web-app:latest

# Build gitlab-web-app image
docker build -t <your-registry>/citrusops-gitlab-web-app:latest ./app/server/GitLab/GitLab-Web-App
docker push <your-registry>/citrusops-gitlab-web-app:latest

# Build cronjob image
docker build -t <your-registry>/citrusops-cronjob:latest ./app/server/ArgoCD/ArgoCD-Monitor-Cronjob
docker push <your-registry>/citrusops-cronjob:latest

# Build notification image
docker build -t <your-registry>/citrusops-notification:latest ./app/server/ArgoCD/Notifications
docker push <your-registry>/citrusops-notification:latest

# Build slack image
docker build -t <your-registry>/citrusops-slack:latest ./app/server/ArgoCD/Slack
docker push <your-registry>/citrusops-slack:latest

# Build email image
docker build -t <your-registry>/citrusops-email:latest ./app/server/ArgoCD/Email
docker push <your-registry>/citrusops-email:latest
```

**Note**: Update the image names in the deployment YAML files to match your registry.

### 5. Deploy Application Services

```bash
# Deploy backend services
kubectl apply -f web-app.yaml
kubectl apply -f gitlab-web-app.yaml

# Deploy worker services
kubectl apply -f cronjob.yaml
kubectl apply -f notification.yaml
kubectl apply -f slack.yaml
kubectl apply -f email.yaml

# Deploy frontend
kubectl apply -f client.yaml
```

### 6. (Optional) Deploy Ingress

If you have an NGINX Ingress Controller installed:

```bash
kubectl apply -f ingress.yaml
```

Update your `/etc/hosts` file to point `citrusops.local` to your ingress controller IP.

## Verification

Check the status of all deployments:

```bash
kubectl get all -n citrusops
```

Check logs of a specific service:

```bash
kubectl logs -n citrusops deployment/client
kubectl logs -n citrusops deployment/web-app
```

## Access the Application

### Using LoadBalancer (if supported)

```bash
kubectl get svc -n citrusops client
```

Access the application at the EXTERNAL-IP on port 3000.

### Using Port Forwarding

```bash
kubectl port-forward -n citrusops svc/client 3000:3000
```

Access the application at http://localhost:3000

### Using Ingress

Access the application at http://citrusops.local (after configuring DNS/hosts file)

## Scaling

Scale a deployment:

```bash
kubectl scale deployment/web-app -n citrusops --replicas=3
```

## Updating

Update a deployment after rebuilding the image:

```bash
kubectl rollout restart deployment/client -n citrusops
```

Check rollout status:

```bash
kubectl rollout status deployment/client -n citrusops
```

## Cleanup

Remove all resources:

```bash
kubectl delete namespace citrusops
```

Or remove individual components:

```bash
kubectl delete -f <filename>.yaml
```

## Configuration

### MongoDB Credentials

The MongoDB credentials are stored in a Kubernetes Secret. The default credentials are:

- Username: `mongouser`
- Password: `mongopassword`

To change these, update the base64 encoded values in `mongodb.yaml`:

```bash
echo -n "newusername" | base64
echo -n "newpassword" | base64
```

### Environment Variables

Application-specific environment variables can be added to each deployment's `env` section or centralized in the ConfigMap.

## Troubleshooting

### Pods not starting

Check pod status and events:

```bash
kubectl describe pod -n citrusops <pod-name>
```

### Database connection issues

Verify MongoDB is running:

```bash
kubectl exec -it -n citrusops deployment/mongo -- mongosh -u mongouser -p mongopassword
```

### Network issues

Check service endpoints:

```bash
kubectl get endpoints -n citrusops
```

## Notes

- The original docker-compose used `network_mode: host`, which is not directly supported in Kubernetes. Services communicate via Kubernetes Service DNS names.
- Persistent storage for MongoDB uses a PersistentVolumeClaim. Ensure your cluster has a default StorageClass or create one.
- Resource requests and limits are set conservatively and should be adjusted based on your workload.
- Health checks (liveness/readiness probes) are configured for HTTP services. Adjust paths as needed based on your application.

## Production Considerations

1. **Security**:

   - Use proper secrets management (e.g., HashiCorp Vault, Sealed Secrets)
   - Enable RBAC and network policies
   - Use TLS/SSL for ingress

2. **High Availability**:

   - Increase replicas for critical services
   - Use PodDisruptionBudgets
   - Consider multi-zone deployment

3. **Monitoring**:

   - Integrate with Prometheus/Grafana
   - Set up logging with ELK or Loki
   - Configure alerts

4. **Backup**:
   - Implement regular MongoDB backups
   - Use VolumeSnapshots for persistent data
