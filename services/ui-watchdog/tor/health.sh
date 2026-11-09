#!/bin/sh
set -eu
cookie=$(od -An -v -tx1 /tmp/tor-control.auth | tr -d ' \n')
printf 'AUTHENTICATE %s\r\nGETINFO status/bootstrap-phase\r\nQUIT\r\n' "$cookie" |
  nc -w 5 127.0.0.1 9051 | grep -q 'PROGRESS=100'
