# TimoHouse – Kiến trúc triển khai, CI/CD và vận hành Production

## 1. Mục tiêu

Tài liệu này mô tả kiến trúc triển khai production cho TimoHouse theo hướng:

- Đơn giản, dễ vận hành.
- Phù hợp mô hình freelancer/small team.
- Có thể chạy ổn định trên 1 VPS giai đoạn đầu.
- Có CI/CD tự động.
- Có rollback khi deploy lỗi.
- Có monitoring, logging và alert.
- Có backup dữ liệu và file.
- Có khả năng mở rộng khi số lượng khách thuê tăng.
- Hỗ trợ message engine gửi thông báo Zalo định kỳ.

---

# 2. Kiến trúc tổng thể

```text
                           INTERNET
                               │
                               ▼
                    Cloudflare DNS / WAF
                               │
                               ▼
                       Nginx / Traefik
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
          Frontend                           Backend API
                                                │
                         ┌──────────────────────┼──────────────────────┐
                         │                      │                      │
                         ▼                      ▼                      ▼
                    PostgreSQL               Redis               Queue Worker
                                                                        │
                                                                        ▼
                                                                    Zalo API
                                                                        │
                                                                        ▼
                                                                  Webhook Callback

                         │
                         ├──────────────► Cloudflare R2
                         │                   ├── Contract
                         │                   ├── Invoice PDF
                         │                   ├── CCCD / Images
                         │                   ├── Evidence
                         │                   └── Backup
                         │
                         └──────────────► Monitoring / Logging
                                             ├── Grafana
                                             ├── Loki
                                             ├── Alloy
                                             ├── Sentry
                                             └── External Uptime
```

---

# 3. Thành phần hạ tầng đề xuất

## 3.1. VPS Production

Giai đoạn đầu có thể sử dụng:

```text
5 vCore
8 GB RAM
70 GB NVMe
300 Mbps
Unlimited Bandwidth
```

VPS chịu trách nhiệm chạy:

```text
OS
Docker
Nginx
Frontend
Backend API
Worker
Scheduler
PostgreSQL
Redis
Monitoring Agent
Temporary files
Short-retention logs
```

Không nên lưu lâu dài:

```text
Contract
Invoice PDF
CCCD
Ảnh hiện trạng
Ảnh bằng chứng
File upload người dùng
```

Các file này chuyển sang Object Storage.

---

# 4. Object Storage

Khuyến nghị sử dụng:

```text
Cloudflare R2
```

Thay vì lưu file trực tiếp trên VPS.

Cấu trúc bucket đề xuất:

```text
timohouse-production/
│
├── contracts/
├── invoices/
├── identities/
├── payments/
├── maintenance/
└── temporary/

timohouse-backup/
│
├── database/
├── configs/
└── archive/
```

Nguyên tắc:

- Không public bucket trực tiếp nếu không cần.
- Dùng signed URL khi tải file nhạy cảm.
- Phân quyền credential tối thiểu.
- Production và Backup tách bucket.
- Có lifecycle cho file tạm.

---

# 5. Docker Architecture

Không cần Kubernetes trong Phase 1.

Sử dụng:

```text
Docker Compose
```

Ví dụ:

```text
docker-compose.production.yml

services:
├── nginx
├── frontend
├── backend-api
├── worker
├── scheduler
├── postgres
├── redis
├── grafana-alloy
└── node-exporter
```

Có thể bổ sung:

```text
loki
prometheus
```

nếu muốn self-host monitoring.

---

# 6. Network Architecture

Không expose toàn bộ service ra Internet.

```text
Internet
   │
   ▼
Nginx
   │
   ├── Frontend
   │
   └── Backend API
           │
           ├── PostgreSQL
           └── Redis
```

Chỉ mở:

```text
80
443
SSH port
```

PostgreSQL và Redis:

```text
KHÔNG public Internet
```

Chỉ chạy trong Docker private network hoặc localhost/VPN.

---

# 7. Quy trình CI/CD

Không nên deploy production bằng:

```text
git pull
npm install
npm run build
pm2 restart
```

Nên chuyển sang CI/CD chuẩn.

## 7.1. Flow CI/CD

```text
Developer
   │
   ▼
Git Push / Merge
   │
   ▼
GitHub Actions
   │
   ├── Install dependencies
   ├── Lint
   ├── Type Check
   ├── Unit Test
   ├── Build
   ├── Build Docker Image
   └── Security / dependency check
   │
   ▼
Push Docker Image
   │
   ▼
GitHub Container Registry
   │
   ▼
Production Server
   │
   ├── Pull new image
   ├── Run DB migration
   ├── Start new containers
   ├── Health Check
   └── Switch traffic
```

---

# 8. Versioning Docker Image

Không dùng:

```text
latest
```

cho production deployment.

Nên dùng:

```text
timohouse-api:1.2.5
timohouse-web:1.2.5
timohouse-worker:1.2.5
```

Hoặc theo Git commit:

```text
timohouse-api:a3b82fd
```

Có thể push đồng thời:

```text
1.2.5
production
```

nhưng deployment phải lưu chính xác version đang chạy.

---

# 9. Deployment Flow

```text
Release v1.2.5
     │
     ▼
Pull Docker Images
     │
     ▼
Backup DB / Migration Check
     │
     ▼
Run Database Migration
     │
     ▼
Start New Containers
     │
     ▼
Health Check
     │
     ├── SUCCESS
     │       │
     │       ▼
     │   Deployment Complete
     │
     └── FAILED
             │
             ▼
          Rollback
```

---

# 10. Health Check

Backend cần có:

```http
GET /health
```

Ví dụ:

```json
{
  "status": "ok",
  "services": {
    "api": "ok",
    "database": "ok",
    "redis": "ok",
    "storage": "ok"
  }
}
```

Ngoài ra nên có:

```http
GET /health/live
GET /health/ready
```

Ý nghĩa:

```text
/live
Application process còn sống.

/ready
Application thực sự sẵn sàng nhận traffic.
```

`ready` nên kiểm tra:

- Database.
- Redis.
- Storage dependency tối thiểu.
- Migration compatibility.

---

# 11. Rollback Strategy

```text
Current:
timohouse-api:1.2.4

Deploy:
timohouse-api:1.2.5

Health Check Failed

Rollback:
timohouse-api:1.2.4
```

Flow:

```text
Deploy
 ↓
Health Check FAIL
 ↓
Stop new version
 ↓
Start previous image
 ↓
Health Check
 ↓
Send alert
```

---

# 12. Database Migration

Migration cần được version control.

```text
migrations/
├── 001_create_users.sql
├── 002_create_buildings.sql
├── 003_create_rooms.sql
├── 004_create_invoices.sql
└── ...
```

Nguyên tắc:

- Không sửa migration cũ đã chạy production.
- Migration phải backward-compatible khi có thể.
- Migration lớn cần backup trước.
- Không chạy destructive migration cùng lúc với release quan trọng.

---

# 13. Message Engine cho Zalo

Không nên gọi Zalo API trực tiếp trong vòng lặp lớn.

Sai:

```text
Cron
 ↓
Load 1000 customers
 ↓
for each customer
 ↓
Call Zalo API
```

Đúng:

```text
Scheduler
    │
    ▼
Message Batch
    │
    ▼
Redis Queue
    │
    ▼
Worker
    │
    ▼
Zalo API
    │
    ▼
Webhook Callback
```

---

# 14. Redis Queue

Nếu Backend dùng Node.js có thể dùng:

```text
Redis
+
BullMQ
```

Ví dụ batch:

```text
Batch: ZL-202610-001

Recipients: 1000
Queued:     1000
Sending:      25
Success:     945
Failed:       35
Retry:        20
```

Queue giúp:

- Giới hạn tốc độ gọi API.
- Retry.
- Không block API chính.
- Theo dõi trạng thái.
- Scale worker riêng khi cần.

---

# 15. Trạng thái Message

```text
CREATED
 ↓
QUEUED
 ↓
PROCESSING
 ↓
SENT
 ↓
DELIVERED
```

Khi lỗi:

```text
PROCESSING
 ↓
FAILED
 ↓
WAITING_RETRY
 ↓
RETRYING
 ↓
SENT
 ↓
DELIVERED
```

Hoặc:

```text
FAILED_FINAL
```

khi đã vượt số lần retry.

---

# 16. Message Log

Nên lưu tối thiểu:

```text
batch_id
recipient_id
customer_id
room_id

template_id
template_version

scheduled_at
queued_at
sent_at
delivered_at

provider_message_id

provider_response_code
provider_response_message

status

retry_count
next_retry_at

created_at
updated_at
```

Mục đích:

- Kiểm tra khách có được gửi hay chưa.
- Tra cứu lỗi.
- Retry chính xác.
- Audit lịch sử.
- Thống kê tỷ lệ gửi thành công.

---

# 17. Scheduler

Scheduler chịu trách nhiệm các job định kỳ.

```text
00:05
Generate monthly invoices

08:00
Check invoice due reminder

08:15
Create Zalo reminder batch

08:20
Queue recipients

Every 5 minutes
Retry failed eligible messages

23:30
Backup database
```

Không nên chạy business logic dài trực tiếp trong cron.

Cron chỉ nên:

```text
Trigger Job
```

Sau đó worker xử lý.

---

# 18. Monitoring Architecture

Monitoring không nên chỉ nằm trong production VPS.

Nếu monitoring cùng server:

```text
Production Down
+
Monitoring Down
=
Không có alert
```

Nên:

```text
Production VPS
      │
      ▼
External Monitoring
```

Có thể dùng:

```text
Grafana Cloud
UptimeRobot
Better Stack
```

hoặc VPS monitoring riêng.

---

# 19. Metrics cần theo dõi

## VPS

```text
CPU
RAM
Disk
Disk IO
Load Average
Network
File descriptors
```

## Docker

```text
Container status
CPU/container
Memory/container
Restart count
```

## Backend

```text
Request count
Latency
P50 / P95 / P99
HTTP 4xx
HTTP 5xx
Active requests
```

## PostgreSQL

```text
Connections
Slow queries
Locks
Database size
Replication/backup status
```

## Redis

```text
Memory
Connected clients
Queue size
Eviction
Latency
```

## Message Queue

```text
Queued
Processing
Completed
Failed
Retrying
Oldest pending job
```

## Zalo

```text
Messages sent
Success rate
Failure rate
Retry rate
Webhook delay
Provider errors
```

---

# 20. Alert Rules

## CPU

```text
CPU > 85%
for 5 minutes
→ Warning
```

```text
CPU > 95%
for 5 minutes
→ Critical
```

## RAM

```text
RAM > 85%
→ Warning

RAM > 95%
→ Critical
```

## Disk

```text
Disk > 70%
→ Warning

Disk > 85%
→ Critical

Disk > 92%
→ Emergency
```

## API

```text
HTTP 5xx > 2%
for 5 minutes
→ Critical
```

```text
P95 latency > 2 seconds
for 5 minutes
→ Warning
```

## Database

```text
DB connections > 80%
→ Warning
```

```text
Slow query count increases abnormally
→ Warning
```

## Queue

```text
Queue backlog > configured threshold
→ Warning
```

```text
No worker heartbeat
→ Critical
```

## Zalo

```text
Batch failure rate > 5%
→ Warning
```

```text
Batch failure rate > 15%
→ Critical
```

```text
Webhook delay > 10 minutes
→ Warning
```

---

# 21. Alert Channel

Có thể gửi alert vào Google Chat.

```text
Monitoring
    │
    ▼
Alert Manager
    │
    ▼
Google Chat Webhook / App
```

Ví dụ:

```text
🔴 TimoHouse Production

CPU: 93%
Duration: 6 minutes
Server: timohouse-prod-01

API P95: 3.4s
5xx Rate: 3.1%
```

Zalo alert:

```text
🟠 Zalo Message Alert

Batch: ZL-202610-003

Total:   1000
Sent:     842
Failed:    68

Failure Rate: 7.47%
```

---

# 22. Logging Architecture

Không khuyến nghị ELK trên VPS 8 GB.

Khuyến nghị:

```text
Application
    │
    ▼
Grafana Alloy
    │
    ▼
Loki
    │
    ▼
Grafana
```

Các nhóm log:

```text
API logs
Worker logs
Scheduler logs
Zalo logs
Authentication logs
Security logs
Deployment logs
Database backup logs
```

---

# 23. Log Retention

```text
Local log:
7–14 ngày

Remote log:
30–90 ngày
```

Có log rotation:

```text
max-size
max-file
```

để tránh đầy disk.

---

# 24. Error Tracking

Nên dùng:

```text
Sentry
```

cho cả frontend và backend.

Ví dụ error:

```text
500 Internal Server Error

Action:
Create Invoice

customer_id: 1832
room_id: A1203
request_id: abc123

release: 1.2.5
environment: production
```

Sentry giúp xem:

- Stack trace.
- Browser.
- API.
- Release.
- User context phù hợp.
- Frequency.
- First/last seen.

---

# 25. Backup Architecture

Không backup database chỉ trên VPS.

Sai:

```text
PostgreSQL
 ↓
/backup/db.sql
```

Đúng:

```text
PostgreSQL
    │
    ▼
Daily Backup
    │
    ▼
Compress
    │
    ▼
Encrypt
    │
    ▼
Cloudflare R2 Backup Bucket
```

---

# 26. Backup Retention

Đề xuất:

```text
Daily:   7 bản
Weekly:  4 bản
Monthly: 6 bản
```

Hoặc:

```text
Daily   14
Weekly   8
Monthly 12
```

nếu dữ liệu quan trọng hơn.

---

# 27. PostgreSQL Point-in-Time Recovery

Nếu muốn an toàn hơn:

```text
PostgreSQL
    │
    ├── Daily Base Backup
    │
    └── WAL Archive
             │
             ▼
             R2
```

Cho phép restore gần thời điểm sự cố.

---

# 28. Backup Verification

Backup không có ý nghĩa nếu chưa test restore.

Nên có job:

```text
Backup
 ↓
Verify file
 ↓
Check checksum
 ↓
Record status
```

Định kỳ:

```text
Monthly Restore Test
```

restore database vào environment test để kiểm tra.

---

# 29. Security VPS

Tối thiểu:

```text
Cloudflare
    ↓
Firewall
    ↓
Nginx
    ↓
Application
```

VPS:

- SSH bằng key.
- Disable SSH password.
- Disable root login trực tiếp.
- UFW/firewall.
- Fail2ban.
- Không public PostgreSQL.
- Không public Redis.
- Docker private network.
- Automatic security updates có kiểm soát.
- Rate limiting.
- TLS.
- Secret không commit vào Git.

---

# 30. Secrets Management

Không lưu production secret trong source code.

Sai:

```text
DATABASE_PASSWORD=abc123
```

Đúng:

```text
GitHub Actions Secrets
Server Environment
Docker Secrets
Secret Manager nếu sau này chuyển cloud
```

Các secret:

```text
DB_PASSWORD
REDIS_PASSWORD
R2_ACCESS_KEY
R2_SECRET_KEY
ZALO_APP_SECRET
JWT_SECRET
SENTRY_DSN
```

---

# 31. Deployment Permission

Không để developer SSH root và deploy thủ công tùy ý.

Nên:

```text
Developer
 ↓
Pull Request
 ↓
Review
 ↓
Merge
 ↓
CI/CD
 ↓
Production
```

Manual deploy chỉ dành cho emergency.

---

# 32. Environment

Tối thiểu nên có:

```text
Local
Staging
Production
```

Flow:

```text
Feature Branch
 ↓
Development
 ↓
Staging
 ↓
UAT
 ↓
Production
```

Không test trực tiếp trên production.

---

# 33. Staging

Staging có thể cấu hình nhỏ hơn.

Ví dụ:

```text
2 vCPU
2–4 GB RAM
```

Staging dùng:

- Test migration.
- Test Zalo sandbox/test account.
- UAT.
- Test release.

---

# 34. Production Deployment Checklist

Trước deployment:

```text
[ ] PR reviewed
[ ] Test passed
[ ] Build passed
[ ] Migration reviewed
[ ] Backup successful
[ ] Release version created
```

Sau deployment:

```text
[ ] /health/live OK
[ ] /health/ready OK
[ ] Frontend accessible
[ ] Login works
[ ] DB connection OK
[ ] Redis OK
[ ] Queue worker OK
[ ] Scheduler OK
[ ] R2 upload OK
[ ] Zalo integration health OK
[ ] Monitoring receiving metrics
[ ] No unusual error in Sentry
```

---

# 35. Incident Flow

```text
Monitoring detects issue
        │
        ▼
Alert Google Chat
        │
        ▼
Developer checks Dashboard
        │
        ├── Metrics
        ├── Logs
        ├── Sentry
        └── Recent Deploy
        │
        ▼
Determine cause
        │
        ├── Application bug
        ├── DB problem
        ├── VPS resource
        ├── Zalo provider
        └── Network
```

Nếu lỗi do release:

```text
Rollback
```

Nếu lỗi resource:

```text
Restart service / scale / clean disk
```

Nếu lỗi DB:

```text
Stop risky writes
Investigate
Restore backup if required
```

---

# 36. Scaling Strategy

Giai đoạn đầu:

```text
1 VPS
```

Khi tăng tải:

```text
Stage 1:
Increase CPU/RAM
```

Tiếp:

```text
Stage 2:

VPS App
  │
  ├── Frontend
  ├── API
  └── Worker

DB Server
  └── PostgreSQL
```

Tiếp:

```text
Stage 3:

Load Balancer
   │
   ├── App 1
   └── App 2

Managed PostgreSQL
Redis
R2
Worker Pool
```

Không cần Kubernetes ngay từ đầu.

---

# 37. Khả năng đáp ứng Message Volume

Ví dụ hiện tại:

```text
1.000 khách
×
2 messages / tháng
=
2.000 messages / tháng
```

Mức này rất nhỏ đối với:

```text
Redis + Queue + Worker
```

Ngay cả:

```text
10.000 khách
×
2
=
20.000 message/tháng
```

vẫn xử lý tốt với kiến trúc này nếu queue và rate limit đúng.

---

# 38. Kiến trúc đề xuất cho Phase 1

```text
Cloudflare
│
├── DNS
├── WAF
└── SSL
     │
     ▼
Production VPS
│
├── Nginx
├── Frontend
├── Backend API
├── Worker
├── Scheduler
├── PostgreSQL
├── Redis
└── Monitoring Agent
     │
     ├────────► Cloudflare R2
     │             ├── Assets
     │             └── Backup
     │
     ├────────► Zalo API
     │
     ├────────► Sentry
     │
     └────────► Grafana / External Monitoring
                       │
                       ▼
                    Google Chat
```

---

# 39. Stack đề xuất

## Application

```text
Frontend:
React / Nuxt tùy codebase

Backend:
Node.js

Database:
PostgreSQL

Cache / Queue:
Redis

Queue:
BullMQ
```

## Deployment

```text
Docker
Docker Compose
Nginx
GitHub Actions
GitHub Container Registry
```

## Storage

```text
Cloudflare R2
```

## Monitoring

```text
Grafana
Grafana Alloy
Node Exporter
External uptime monitor
```

## Logging

```text
Loki
Grafana
```

## Error Tracking

```text
Sentry
```

## Alert

```text
Google Chat
```

---

# 40. Kết luận

Kiến trúc Phase 1 không cần phức tạp theo kiểu enterprise cloud ngay từ đầu.

Hướng phù hợp cho TimoHouse:

```text
1 VPS Production
+
Docker Compose
+
PostgreSQL
+
Redis / Queue
+
Cloudflare R2
+
CI/CD
+
Monitoring
+
Logging
+
Backup
+
External Alert
```

Điểm quan trọng không nằm ở việc có nhiều server, mà là hệ thống phải có:

- Deployment tự động.
- Version rõ ràng.
- Health check.
- Rollback.
- Backup ngoài VPS.
- Monitoring chủ động.
- Centralized log.
- Error tracking.
- Queue cho message.
- Alert khi bất thường.
- Quy trình xử lý incident.

Kiến trúc này phù hợp để TimoHouse chạy production ở quy mô ban đầu và vẫn có đường nâng cấp rõ ràng khi số lượng phòng, khách thuê, hóa đơn và message tăng lên.
