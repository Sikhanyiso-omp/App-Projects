# Operations Runbook

## Start or update

```bash
git pull --ff-only
docker compose build --pull
docker compose up -d
docker compose ps
```

## Health checks

```bash
curl --fail http://localhost:8080/health
curl --fail http://localhost:8080/api/health
```

Both endpoints must return successfully before traffic is considered healthy.

## Logs

```bash
docker compose logs --since=15m frontend
docker compose logs --since=15m api
docker compose logs -f api
```

## Backup

The application data lives in the `legacy-data` Docker volume. Stop writes before taking a consistent file backup:

```bash
docker compose stop api
docker run --rm -v app-projects_legacy-data:/data -v "$PWD/backups:/backup" alpine \
  tar czf /backup/legacy-data-$(date +%F-%H%M).tgz -C /data .
docker compose start api
```

Verify the archive exists and periodically test restoration in a non-production environment.

## Rollback

1. Identify the last known-good Git tag or commit.
2. Check it out on the deployment host.
3. Rebuild the images.
4. Start Compose and verify both health endpoints.
5. Review API logs for authentication, datastore or inventory errors.

## Incident checklist

- Confirm container health with `docker compose ps`.
- Check disk capacity and volume availability.
- Inspect recent API and Nginx logs.
- Verify required environment variables exist without printing their values.
- If credentials may be exposed, rotate them before restoring service.
