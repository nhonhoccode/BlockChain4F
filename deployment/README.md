# Deployment

This directory contains configuration files for deploying the Commune Blockchain project.

## Docker Deployment

The application is containerized using Docker and orchestrated with Docker Compose. The setup includes:

- **Web Application**: Django application running with Gunicorn
- **Database**: PostgreSQL for data storage
- **Web Server**: Nginx for serving static files and as a reverse proxy
- **Blockchain**: Ganache for local Ethereum blockchain development

### Quick Start

1. Make sure Docker and Docker Compose are installed on your system
2. Configure environment variables in `.env` file
3. From the project root, run:

```bash
make docker-build
make docker-up
```

To stop the containers:

```bash
make docker-down
```

## Configuration Files

- `Dockerfile`: Multi-stage build for the Django application
- `docker-compose.yml`: Service definitions and container orchestration
- `nginx/default.conf`: Nginx configuration for serving the application

## Deployment to Production

For production deployment, make sure to:

1. Update the `.env` file with production settings:
   - Set `DEBUG=False`
   - Configure a secure `SECRET_KEY`
   - Set proper database credentials
   - Configure email settings
   - Enable security settings

2. Update the Nginx configuration with your domain name(s)

3. Consider setting up:
   - SSL certificates (Let's Encrypt)
   - Database backups
   - CI/CD pipeline for automated deployments
   - Monitoring and logging solutions

## Production Deployment Notes

For production deployments:

1. Edit the `.env` file to set appropriate production values:
   - Set `DEBUG=False`
   - Set strong, unique `SECRET_KEY`
   - Configure security settings
   - Set up production database credentials

2. Modify `nginx/nginx.conf` to include your domain and SSL configuration

3. Consider using Docker volumes for persistent data

## Troubleshooting

If you encounter issues during deployment:

1. Check the Docker and Nginx logs for errors
2. Verify that all required environment variables are set
3. Ensure ports 80 and 8000 are available on your system
4. Make sure all services are running with `docker-compose ps` 