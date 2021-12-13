#!/bin/bash

# reloadSetappAgent.sh
# Setapp
# Script to be used to reload SetappAgent with launchd
#
# Created by Mykyta Kyrychek on 14.08.18.
# Copyright © 2018 Setapp. All rights reserved.
#

AGENT_PLIST="$1"
launchctl unload -w "$AGENT_PLIST"
launchctl load -w "$AGENT_PLIST"

