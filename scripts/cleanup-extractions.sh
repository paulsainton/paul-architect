#!/bin/bash
# Cleanup des extractions Playwright > 30 jours avec soft-delete vers archive
# Cron suggere : 0 4 * * * /opt/paul-architect/scripts/cleanup-extractions.sh

DATA_DIR="/opt/paul-architect/data/extractions"
ARCHIVE_DIR="/opt/paul-architect/data/extractions-archive"
RUNS_DIR="/opt/paul-architect/data/runs"
AGE_DAYS=30

mkdir -p "$ARCHIVE_DIR"

# R\u00e9cup\u00e9rer les runIds en status 'running' pour les skipper
RUNNING_IDS=$(find "$RUNS_DIR" -maxdepth 1 -name "*.json" -not -name "*.archived.json" -not -name "*.tmp" -exec grep -l '"status":"running"' {} \; 2>/dev/null | xargs -I{} basename {} .json)

ARCHIVED=0
SKIPPED=0
for run_dir in "$DATA_DIR"/*/; do
  run_id=$(basename "$run_dir")
  # Skip si en cours
  if echo "$RUNNING_IDS" | grep -q "^$run_id$"; then
    SKIPPED=$((SKIPPED + 1))
    continue
  fi
  # Skip si < 30 jours
  age_days=$(( ($(date +%s) - $(stat -c %Y "$run_dir")) / 86400 ))
  if [ "$age_days" -lt "$AGE_DAYS" ]; then
    continue
  fi
  # Soft-delete : mv vers archive
  mv "$run_dir" "$ARCHIVE_DIR/" && ARCHIVED=$((ARCHIVED + 1))
done

echo "[cleanup] archived=$ARCHIVED skipped_running=$SKIPPED age_threshold=${AGE_DAYS}d"

# Purge finale : archive > 90 jours rm
find "$ARCHIVE_DIR" -maxdepth 1 -type d -mtime +90 -exec rm -rf {} \; 2>/dev/null

# Cleanup runs archived > 90 jours
find "$RUNS_DIR" -name "*.archived.json" -mtime +90 -delete 2>/dev/null
