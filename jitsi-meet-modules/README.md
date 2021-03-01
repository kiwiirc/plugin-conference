# Jitsi Meet Kiwi IRC auth plugin

## About

This repository contains modified copy of Jitsi Meet's Prosody token authentication modules for use with [kiwiirc/plugin-conference].

The purpose of these files is to mirror the access control model and user identity from the IRC environment to the Jitsi conference room.

This auth method is necessary when using `{ "conference.secure": true }` in your KiwiIRC client config.

___

## Docker install

Follow the [jitsi documentation](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-docker) for setting up jitsi docker

After setting up docker copy the contents of `jitsi-meet-modules/` to `~/.jitsi-meet-cfg/prosody/prosody-plugins-custom`

### Editing the docker .env file

Uncomment and set the following settings

```
ENABLE_WELCOME_PAGE=0

ENABLE_AUTH=1

ENABLE_GUESTS=0

AUTH_TYPE=jwt

JWT_APP_ID=<hostname of your ircd as specified in startupOptions.server>

JWT_APP_SECRET=<your jwt secret>

XMPP_MUC_MODULES=kiwi_muc_role_from_jwt,kiwi_presence_identity
```

The following vars will require adding:

```
ENABLE_P2P=false

ENABLE_AUTO_OWNER=false

JWT_AUTH_TYPE=kiwi_token

JWT_TOKEN_AUTH_MODULE=kiwi_token_verification
```

___

## Native install

Before proceeding, you'll need to complete the installation of the Jitsi Meet backend. Using the apt repository mentioned in [Jitsi Meet's instructions](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart), install the `jitsi-meet` and `jitsi-meet-tokens` packages. e.g. `apt-get install jitsi-meet jitsi-meet-tokens`.

> A few hints:
>
> - On Ubuntu 16.04 `jitsi-meet-tokens` currently has a dependency on `prosody-trunk`, rather than the `prosody` package available in the main repositories. See [Prosody's documentation] to add their apt repository as a package source on your system.
> - The Jitsi Meet packaging may have issues on Ubuntu 18.04.
> - Use an interactive shell when installing `jitsi-meet` because the packages will ask questions via debconf during installation and errors will occur if no debconf frontend is available.
> - Install `nginx` **before** `jitsi-meet` if you want the `jitsi-meet` package to automatically create an nginx site configuration for you.
> - On debian there is an issue building the dependencies at install time due to a difference in libssl packages. As a workaround, do `sudo apt-get install apt-transport-https libssl1.0-dev luarocks git && sudo luarocks install luacrypto` before trying to install the jitsi packages. `libssl1.0-dev` is needed to build luacrypto, but it will get uninstalled and replaced with `libssl-dev` due to the dependencies specified by jitsi packages later on.
> - On Ubuntu 20.04 / Debian 10 `liblua5.2-dev` package is required before installing `jitsi-meet-tokens`.
> - To restart jitsi services after editing configs you can use `sudo systemctl restart prosody.service jicofo.service jitsi-videobridge2.service`.

### Post install

After installing the required packages copy the contents of `jitsi-meet-modules/` to `/usr/share/jitsi-meet-kiwi`

### Configuring

In `/etc/prosody/conf.d/<your jitsi domain>.cfg.lua`:

1. Edit `plugin_paths` to add the newly created `/usr/share/jitsi-meet-kiwi` directory.

2. At the top level of the config, add these two lines, replacing `<your jitsi domain>` with the appropriate value for your installation:

```lua
jitsi_meet_domain = "<your jitsi domain>";
jitsi_meet_focus_hostname = "auth.<your jitsi domain>";
```

3. `authentication = "kiwi_token"`

4. `app_secret` (referred to as `application secret` during the interactive debconf prompts) needs to match the secret set in your webircgateway config.

5. `app_id` (`application ID` in debconf) must match the hostname in the upstream section of your webircgateway config **as well as** the server hostname that the KiwiIRC *client* uses (i.e. `startupOptions.server` in the client `config.json`)

6. Remove `"token_verification"` and add `"kiwi_token_verification"; "kiwi_muc_role_from_jwt"; "kiwi_presence_identity";` to `modules_enabled` in `Component "conference.<your jitsi domain>" "muc"`.

7. If you're hosting Jitsi on a separate hostname from KiwiIRC, you will need to either add

```lua
cross_domain_bosh = true;
```

at the top level of the config or manually add CORS headers in your nginx config.

### Jicofo SIP Communicator properties

8. Open `/etc/jitsi/jicofo/sip-communicator.properties` and add the following line:

```ini
org.jitsi.jicofo.DISABLE_AUTO_OWNER=True
```

### Jitsi Meet config

9. You may also want to disable P2P connectivity in the videobridge's config file at `/etc/jitsi/meet/<your jitsi domain>-config.js`.

```js
p2p: { enabled: false }
```

See `/usr/share/doc/jitsi-meet-web-config/config.js` for an example of the configuration format.
