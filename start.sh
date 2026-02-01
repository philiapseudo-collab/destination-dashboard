#!/bin/sh
cd web/.next/standalone
export HOSTNAME=0.0.0.0
exec node server.js
