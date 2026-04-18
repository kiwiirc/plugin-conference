local LOGLEVEL = "debug";

local usermanager = require "core.usermanager";
local is_healthcheck_room = module:require "util".is_healthcheck_room;
local timer = require "util.timer";
local st = require "util.stanza";
local it = require "util.iterators";
local jid = require "util.jid";

local kiwi_util = module:require "kiwiirc_util";
local query_pattern = kiwi_util.query_pattern();

module:log(LOGLEVEL, "loaded");

local function _is_admin(jid)
    local roles = usermanager.get_roles and usermanager.get_roles(jid, module.host);
    if roles then
        return roles["prosody:operator"] or roles["prosody:admin"];
    end
    return usermanager.is_admin(jid, module.host);
end

module:hook("muc-occupant-pre-join", function(event)
    local allow_guest_create = kiwi_util.get_kiwiirc_env("KIWIIRC_ALLOW_GUEST_CREATE");

    if allow_guest_create then
        return;
    end

    local room, origin, stanza, session = event.room, event.origin, event.stanza, event.session;
    if not event.is_new_room then
        local affiliation = origin.jitsi_meet_affiliation;
        local participant_count = it.count(room:each_occupant());
        local auth_domain = kiwi_util.get_kiwiirc_env("XMPP_AUTH_DOMAIN") or "auth.meet.jitsi";
        local has_affiliate = false;

        if affiliation ~= nil then
            -- User is an affiliate meaning they authed with jwt token
            has_affiliate = true;
        else
            -- User is a guest
            for _, o in room:each_occupant() do
                -- Check current members for a user who authed with jwt token
                if o.bare_jid:match("^focus@" .. auth_domain) == nil and room:get_affiliation(o.jid) ~= nil then
                    has_affiliate = true;
                end
            end
        end

        if not has_affiliate then
            -- User is a guest and no irc users are present
            origin.send(st.error_reply(stanza, "cancel", "service-unavailable", "No IRC user is present in conference room"));
            return true;
        end
    end
end)

module:hook("muc-occupant-pre-join", function(event)
    local room, origin, stanza = event.room, event.origin, event.stanza;
    local room_node = jid.node(room.jid);

    if not room_node or not room_node:match(query_pattern) then
        return;
    end

    if _is_admin(stanza.attr.from) then
        return;
    end

    local user_nick = origin.jitsi_meet_context_user and origin.jitsi_meet_context_user.name;
    local iss = origin.jitsi_meet_issuer;

    if not user_nick or not iss then
        return;
    end

    local peer_nick = stanza:get_child_text('email');
    if not peer_nick or peer_nick == "" then
        module:log("warn", "query room join rejected: no peer nick in presence for user '%s'", user_nick);
        origin.send(st.error_reply(stanza, "cancel", "not-allowed", "Query conference requires peer identification"));
        return true;
    end

    local nicks = { user_nick, peer_nick };
    table.sort(nicks);
    local sorted_pair = nicks[1] .. "+" .. nicks[2];
    local expected_node = "q-" .. kiwi_util.encode_room_name(iss, sorted_pair);

    if room_node ~= expected_node then
        module:log("warn", "query room join rejected: '%s' claimed peer '%s' but room '%s' ~= expected '%s'",
            user_nick, peer_nick, room_node, expected_node);
        origin.send(st.error_reply(stanza, "cancel", "not-allowed", "Not authorized for this query conference"));
        return true;
    end
end)

module:hook("muc-occupant-joined", function (event)
    local room, occupant = event.room, event.occupant;

    if is_healthcheck_room(room.jid) or _is_admin(occupant.jid) then
        module:log(LOGLEVEL, "skip affiliation, %s", occupant.jid);
        return;
    end

    if not event.origin.auth_token then
        module:log(LOGLEVEL, "skip affiliation, no token");
        return;
    end

    local affiliation = event.origin.jitsi_meet_affiliation;

    if affiliation == nil then
        return;
    end

    local i = 0
    local function setAffiliation()
        room:set_affiliation(true, occupant.bare_jid, affiliation)
        if i > 3 then return end;

        i = i + 1;
        timer.add_task(0.2 * i, setAffiliation);
    end
    setAffiliation()

    module:log(LOGLEVEL, "replacing affiliation: '%s' with '%s' for %s", room:get_affiliation(occupant.jid), affiliation, occupant.jid)
end)
