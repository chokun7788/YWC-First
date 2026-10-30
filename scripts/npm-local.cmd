@echo off
setlocal
pushd "%~dp0.."
set "PATH=%CD%\.rd-ready-build\tools\node-v24.22.1-win-x64;%PATH%"
set "npm_config_cache=%CD%\.rd-ready-build\npm-cache"
set "TEMP=%CD%\.rd-ready-build\temp"
set "TMP=%TEMP%"
set "PLAYWRIGHT_BROWSERS_PATH=%CD%\.rd-ready-build\browsers"
set "NEXT_TELEMETRY_DISABLED=1"
call npm.cmd %*
set "rdExit=%ERRORLEVEL%"
popd
exit /b %rdExit%
