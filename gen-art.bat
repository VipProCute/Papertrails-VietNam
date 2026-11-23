@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Node.js. Hay cai Node.js ban 18 tro len tu https://nodejs.org roi chay lai file nay.
  pause
  exit /b 1
)
node tools\gen-sprites.mjs --wait-until 04:20 %*
pause
