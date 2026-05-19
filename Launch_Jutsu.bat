@echo off
title DomainSphere Launcher
color 0B
echo =================================================================
echo             DOMAINSPHERE - SYSTEM ACTIVATION
echo =================================================================
echo [SYSTEM] Initializing Local Server on port 5700...
echo [SYSTEM] Opening the DomainSphere Dashboard in your browser...
echo -----------------------------------------------------------------
echo TIP: Keep this window open while using the application!
echo -----------------------------------------------------------------

:: Start the default web browser and point it to the app URL
start "" "http://localhost:5700"

:: Start the Python local server (blocks this window and keeps it running)
python -m http.server 5700

pause
