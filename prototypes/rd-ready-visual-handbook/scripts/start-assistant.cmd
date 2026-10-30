@echo off
setlocal
set "PATH=D:\Chokun\.rd-ready-build\tools\node-v24.22.1-win-x64;%PATH%"
pushd "%~dp0.."
call npm.cmd run serve
popd
endlocal
