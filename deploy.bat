@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "index.html" (
  echo Khong thay index.html trong thu muc nay. Hay chay file nay ngay trong thu muc du an.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo Chua co Node.js. Cai Node.js tai https://nodejs.org roi chay lai file nay.
  pause
  exit /b 1
)
call npx --yes vercel@latest whoami >nul 2>nul
if errorlevel 1 (
  echo Chua dang nhap Vercel. Trinh duyet se mo de ban dang nhap, xong thi quay lai cua so nay.
  call npx --yes vercel@latest login
  if errorlevel 1 (
    echo Dang nhap chua xong. Chay lai file nay de thu lai.
    pause
    exit /b 1
  )
)
echo Dang deploy len Vercel...
call npx --yes vercel@latest deploy --prod --yes
pause
