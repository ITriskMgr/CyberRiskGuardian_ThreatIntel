#!/bin/bash
# restart this lane's test server (port 8105 only — never the shared 8099)
fuser -k 8105/tcp 2>/dev/null; sleep 0.5
cd /home/claude/wt-ipc/desktop/app
CRG_AI_MOCK=/home/claude/tmp/mock-ipc CRG_FEEDS_DIR=/home/claude/tmp/feeds-ipc CRGO_HOME=/home/claude/crgo CRG_ORG_DIR=/home/claude/tmp/org-ipc nohup python3 serve.py 8105 > /home/claude/tmp/serve-ipc.log 2>&1 &
sleep 3
