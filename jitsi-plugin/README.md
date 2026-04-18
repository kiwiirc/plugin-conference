# KiwiIRC - Jitsi-meet JWT authentication

### Installing jitsi-meet

It is recommended to use the docker method to install jitsi-meet as this allows better control over the version of jitsi-meet that is used.

The documentation for docker install can be found [here](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker/)

### Configuring docker-jitsi-meet

The files from `jitsi-meet_xxx` should be copied to `prosody/prosody-plugins-custom` within your `CONFIG` path.

There are several environment variables that need setting for docker-jitsi-meet to allow it to work well with kiwiirc-plugin-conference, these are listed below:

```
AUTH_TYPE=jwt
ENABLE_AUTH=1
ENABLE_AUTO_OWNER=0
ENABLE_BREAKOUT_ROOMS=0
ENABLE_GUESTS=0
ENABLE_LOBBY=0
ENABLE_PREJOIN_PAGE=0
ENABLE_WELCOME_PAGE=0
JICOFO_ENABLE_AUTH=0
JWT_ACCEPTED_ISSUERS=<YOUR IRC URL eg irc.example.com>
JWT_APP_ID=<YOUR IRC URL eg irc.example.com>
JWT_APP_SECRET=<YOUR SECRET FOR EXTJWT>
JWT_AUTH_TYPE=kiwiirc_token
JWT_ENABLE_DOMAIN_VERIFICATION=1
JWT_TOKEN_AUTH_MODULE=kiwiirc_token_verification
XMPP_MUC_MODULES=kiwiirc_xmpp_muc
```

It is also advised to set `JITSI_IMAGE_VERSION` so that it does not update unexpectedly.

### Special kiwiirc environment variables

Some environment variables have been added to allow tweaking how the irc token is treated, these are listed below.

```
KIWIIRC_EVERYONE_MODERATOR=0        # makes every user with a token becomes jitsi moderator.
KIWIIRC_DISABLE_OWNER_MODERATOR=0   # stops channel owner from becoming a moderator.
KIWIIRC_DISABLE_OP_MODERATOR=0      # stops op's from becoming a moderator (network operators are always moderators).
KIWIIRC_DISABLE_HALFOP_MODERATOR=0  # stops half-op's from becoming a moderator.
KIWIIRC_DISABLE_QUERY_MODERATOR=0   # stops both members of a query chat becoming moderators.
JWT_VFY_URL=                        # optional URL for an external token verification endpoint (see below).
```

### External token verification (`JWT_VFY_URL`)

When `JWT_VFY_URL` is set, every token must also be accepted by that URL before the user is allowed to connect. Prosody performs a `GET` request to the URL with the token supplied as an `Authorization: Bearer` header. A `200` or `204` response allows the connection; any other response rejects it.

| Configuration | Behaviour |
|---|---|
| `JWT_APP_SECRET` only | HMAC signature check only (default) |
| `JWT_APP_SECRET` + `JWT_VFY_URL` | HMAC signature check **and** URL check — both must pass |
| `JWT_VFY_URL` only | URL is the sole cryptographic authority |

This can alternatively be set as the `jwt_vfy_url` option directly in `prosody.cfg.lua` for non-Docker deployments.

### Token replay protection

Enabled automatically — no configuration required. Each token is recorded by its SHA-256 hash from the moment it is first used to authenticate. Any attempt to reuse the same token for a second connection is rejected with `token has already been used`, even if the signature is still valid. Entries are automatically expired once the token's `exp` claim is reached.


### Allowing users without tokens to connect

To allow users with the link to the conference to connect without a token set the following environment variables
```
ENABLE_GUESTS=1
JWT_ALLOW_EMPTY=1
ENABLE_PREJOIN_PAGE=1
```
