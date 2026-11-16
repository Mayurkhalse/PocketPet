# 🌐 PocketPet REST API Reference (v1)

Base URL: `/api/v1`

All responses follow JSON structure:
- Success: Data payload (object or array)
- Error: `{ "error": { "code": "STRING_CODE", "message": "Human readable message", "details": [] } }`

---

## 1. User Authentication
- `POST /auth/register` - `{ email, password, displayName }` -> `{ user, token }`
- `POST /auth/login` - `{ email, password }` -> `{ user, token }`
- `GET /me` - (Bearer JWT) -> `{ user }`

## 2. Device Management (User Auth Required)
- `GET /devices` - List devices owned or shared with the user
- `POST /devices/claim` - `{ code, name? }` -> Claims an unowned device using 6-digit pairing code
- `GET /devices/:id` - Device details, connection status, derived `online` status
- `PATCH /devices/:id` - Update name or settings (brightness, pollIntervalSec, etc.)
- `DELETE /devices/:id` - Unpair device (owner only)
- `GET /devices/:id/members` - List owner and invited senders
- `POST /devices/:id/invites` - Generate single-use 8-character invite code (48h TTL)
- `POST /invites/accept` - `{ code }` -> Add current user as sender to the device
- `DELETE /devices/:id/members/:userId` - Remove sender (or sender leaves)

## 3. Commands & Messaging
- `POST /devices/:id/commands/content` - Enqueue text or bitmap message (`SHOW_CONTENT`)
- `POST /devices/:id/commands/playlist` - Enqueue playlist playback (`PLAY_PLAYLIST`)
- `POST /devices/:id/commands/stop` - Return device to pet mode immediately (`STOP`)
- `GET /devices/:id/commands` - Command history
- `GET /devices/:id/commands/:cmdId` - Single command status for delivery tracking

## 4. Reactions & Events
- `GET /devices/:id/events?unread=true` - Retrieve unread reactions (heart, smile)
- `POST /devices/:id/events/read` - `{ ids: [...] }` -> Mark reactions as read

## 5. Library (Content & Playlists)
- `GET /contents` & `POST /contents` - Manage saved text/bitmap items
- `GET /contents/:id`, `PATCH /contents/:id`, `DELETE /contents/:id`
- `GET /playlists` & `POST /playlists` - Manage saved playlists
- `GET /playlists/:id`, `PUT /playlists/:id`, `DELETE /playlists/:id`

## 6. Device Hardware API (Device Token Auth)
- `POST /device/register` - `{ hardwareId, fwVersion }` -> `{ deviceToken, pairingCode, expiresAt, pollIntervalSec }`
- `POST /device/pairing-code` - Generate fresh 6-digit code if previous expired
- `GET /device/poll?lastSeq=&fw=&rssi=&bat=&mode=` - Retrieve pending commands, update telemetry
- `POST /device/ack` - `{ acks: [{ seq, status: "ok"|"error", error? }] }`
- `POST /device/event` - `{ type: "REACTION", reaction: "heart"|"smile", refSeq }`

