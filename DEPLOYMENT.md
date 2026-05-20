# Production Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] Change SECRET_KEY to a strong random string (min 32 characters)
- [ ] Update database credentials
- [ ] Configure CORS for specific origins only
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie flags
- [ ] Review and restrict API rate limits

### Environment Variables
```bash
# Production .env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=<generate-strong-random-key-here>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://redis-host:6379/0
ENVIRONMENT=production
```

### Generate Strong Secret Key
```python
import secrets
print(secrets.token_urlsafe(32))
```

## Deployment Options

### 1. Render.com Deployment

#### Step 1: Create PostgreSQL Database
1. Go to Render Dashboard
2. New → PostgreSQL
3. Name: `campuskart-db`
4. Copy Internal Database URL

#### Step 2: Create Redis Instance
1. New → Redis
2. Name: `campuskart-redis`
3. Copy Internal Redis URL

#### Step 3: Deploy Backend API
1. New → Web Service
2. Connect GitHub repository
3. Configure:
   - **Name**: `campuskart-api`
   - **Environment**: `Docker`
   - **Region**: Choose closest to users
   - **Instance Type**: Starter ($7/month) or higher

4. Environment Variables:
   ```
   DATABASE_URL=<internal-postgres-url>
   REDIS_URL=<internal-redis-url>
   SECRET_KEY=<your-secret-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. Deploy!

#### Step 4: Deploy Celery Worker
1. New → Background Worker
2. Same repository
3. **Start Command**: `celery -A app.tasks.celery_app worker --loglevel=info`
4. Same environment variables as backend

### 2. Railway.app Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add services
railway add postgresql
railway add redis

# Deploy
railway up

# Set environment variables
railway variables set SECRET_KEY=<your-secret-key>
```

### 3. AWS ECS Deployment

#### Prerequisites
- AWS Account
- AWS CLI configured
- Docker installed

#### Step 1: Create ECR Repository
```bash
aws ecr create-repository --repository-name campuskart-api
```

#### Step 2: Build and Push Docker Image
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t campuskart-api .

# Tag image
docker tag campuskart-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/campuskart-api:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/campuskart-api:latest
```

#### Step 3: Create RDS PostgreSQL
1. Go to RDS Console
2. Create Database
3. Engine: PostgreSQL 15
4. Template: Production
5. Configure security groups
6. Note connection details

#### Step 4: Create ElastiCache Redis
1. Go to ElastiCache Console
2. Create Redis cluster
3. Configure security groups
4. Note connection endpoint

#### Step 5: Create ECS Task Definition
```json
{
  "family": "campuskart-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "campuskart-api",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/campuskart-api:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/campuskart"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://elasticache-endpoint:6379/0"
        },
        {
          "name": "SECRET_KEY",
          "value": "<your-secret-key>"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/campuskart-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Step 6: Create ECS Service
1. Create ECS Cluster
2. Create Service using Task Definition
3. Configure Load Balancer
4. Set desired task count
5. Configure auto-scaling

### 4. DigitalOcean App Platform

1. Connect GitHub repository
2. Detect Dockerfile automatically
3. Add PostgreSQL and Redis managed databases
4. Configure environment variables
5. Deploy

## Post-Deployment

### Health Check
```bash
curl https://your-domain.com/health
```

### Test API
```bash
curl https://your-domain.com/docs
```

### Monitor Logs
- Check application logs
- Monitor error rates
- Set up alerts

### Database Migrations
```bash
# SSH into container or use Railway/Render shell
alembic upgrade head
```

## Monitoring & Maintenance

### Recommended Tools
- **Logging**: CloudWatch, Datadog, or Sentry
- **Monitoring**: New Relic, Prometheus
- **Uptime**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry

### Backup Strategy
- Automated daily database backups
- Retain backups for 30 days
- Test restore procedures monthly

### Scaling Considerations
- Horizontal scaling: Increase number of containers
- Vertical scaling: Increase container resources
- Database connection pooling
- Redis caching strategy
- CDN for static assets

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Verify network security groups
- Ensure database is accessible from container

**Celery Worker Not Processing**
- Verify REDIS_URL is correct
- Check worker logs
- Ensure worker container is running

**JWT Token Issues**
- Verify SECRET_KEY is consistent across deployments
- Check token expiration settings

**CORS Errors**
- Update CORS origins in main.py
- Ensure frontend domain is whitelisted

## Performance Optimization

1. **Database Indexing**
   - Add indexes on frequently queried columns
   - Monitor slow queries

2. **Caching**
   - Implement Redis caching for listings
   - Cache user sessions

3. **Connection Pooling**
   - Configure SQLAlchemy pool size
   - Set appropriate pool timeout

4. **Load Balancing**
   - Use multiple backend instances
   - Configure health checks

## Security Hardening

1. **Rate Limiting**
   ```python
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   ```

2. **HTTPS Only**
   - Enforce SSL/TLS
   - Use HSTS headers

3. **Input Validation**
   - Already implemented via Pydantic
   - Add additional business logic validation

4. **SQL Injection Prevention**
   - Using SQLAlchemy ORM (protected)
   - Never use raw SQL with user input

5. **Dependency Updates**
   ```bash
   pip list --outdated
   pip install --upgrade <package>
   ```

## Cost Optimization

### Render.com
- Starter: ~$7/month (backend)
- PostgreSQL: ~$7/month
- Redis: ~$10/month
- **Total**: ~$24/month

### Railway.app
- Pay-as-you-go
- ~$5-20/month for small apps

### AWS
- Fargate: ~$15-30/month
- RDS: ~$15-50/month
- ElastiCache: ~$15/month
- **Total**: ~$45-95/month

## Support & Maintenance

- Monitor error rates daily
- Review logs weekly
- Update dependencies monthly
- Security audit quarterly
- Load testing before major releases
