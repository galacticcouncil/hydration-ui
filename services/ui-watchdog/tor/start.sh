#!/bin/sh
set -eu
test -n "${TOR_EXIT_NODES:-}" || { echo 'TOR_EXIT_NODES is required' >&2; exit 1; }
exec tor -f /etc/tor/torrc --ExitNodes "$TOR_EXIT_NODES"
