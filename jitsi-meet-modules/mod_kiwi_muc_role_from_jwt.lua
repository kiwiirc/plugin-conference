

local muc_service = module:depends("muc");
local room_mt = muc_service.room_mt;

--local occupant = muc_service.occupant_mt;
module:set_global();
--module:depends("c2s");
--local sessions = module:shared("c2s/sessions");
local sessions = module:shared("sessions");

local muc_util = module:require "muc/util";
local valid_affiliations = muc_util.valid_affiliations;

local jid_bare = require "util.jid".bare;
local jid_split = require "util.jid".split;

-- package.path = '?.lua;' .. package.path
-- local inspect = require('/usr/share/jitsi-meet/prosody-plugins/inspect');

module:log("info", "kiwiirc patch active: prosody-plugins/mod_kiwi_muc_role_from_jwt.lua");

function len(t)
	local n = 0;
	for _ in pairs(t) do
		n = n + 1
	end
	return n
end

local seen={}

function dump(t,i)
	module:log("debug", "dump table size: " .. len(t));
	seen[t]=true
	local s={}
	local n=0
	for k in pairs(t) do
		n=n+1 s[n]=k
	end
	if pcall(function () table.sort(s); end) then
		table.sort(s)
	end
	for k,v in ipairs(s) do
		module:log("debug", "dump: " .. tostring(i) .. tostring(v))
		v=t[v]
		if type(v)=="table" and not seen[v] then
			dump(v,i.."\t")
		end
	end
end

local jitsi_meet_focus_hostname = module:get_option("jitsi_meet_focus_hostname", os.getenv("XMPP_AUTH_DOMAIN"));

room_mt.get_affiliation = function(room, jid)
    --module:log("debug", "--- entered get_affiliation: jid=" .. jid);
    --module:log("debug", debug.traceback());
--    dump(_G,"");
    -- dump(_G.full_sessions, "");
    --module:log("debug", "sessions - " .. inspect(prosody.full_sessions));
    local bare_jid = jid_bare(jid);
--    module:log("debug", "jid : " .. session);
    --local sess = occupant:get_presence(jid);
    --module.log("debug", "sess - " .. sess);
    local affiliation = nil;

    -- TODO: don't allow earlier sessions to override affiliation claim from later ones
    for conn, session in pairs(prosody.full_sessions) do
        --module:log("debug", "test session: " .. jid .. " - " .. session.full_jid);
        if jid_bare(session.full_jid) == bare_jid then
            --module:log("debug", "found session - " .. inspect(session));
            --module:log("debug", "found session - " .. session.full_jid);
            if valid_affiliations[session.jitsi_meet_room_affiliation] ~= nil then
                affiliation = session.jitsi_meet_room_affiliation;
                -- module:log("debug", "setting affil - " .. affiliation);
            end
        end
    end
    local default_focus_affil = "owner";
    local node, host, resource = jid_split(jid);
    if host == jitsi_meet_focus_hostname then
        module:log("debug", "affil (focus): " .. default_focus_affil .. " jid: " .. jid);
        return default_focus_affil;
    end
    local default_affil = "member";
    if affiliation == nil then
        module:log("debug", "affil (default): " .. default_affil .. " jid: " .. jid);
        return default_affil;
    end
    module:log("debug", "affil: " .. affiliation .. " jid: " .. jid);
    return affiliation;
end
