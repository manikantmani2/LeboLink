@echo off
REM Test Script for LeboLink Deployment (Windows)

echo.
echo ==========================================
echo LeboLink Deployment Test
echo ==========================================

REM Test 1: Check if dependencies are installed
echo.
echo [1/5] Checking dependencies...
if exist "package-lock.json" (
    echo [OK] package-lock.json exists
) else (
    echo [ERROR] package-lock.json missing
    exit /b 1
)

REM Test 2: Verify builds
echo.
echo [2/5] Building monorepo...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Build successful
) else (
    echo [ERROR] Build failed
    exit /b 1
)

REM Test 3: Check API configuration
echo.
echo [3/5] Checking API configuration...
findstr /M "GET /api/v1/health" apps\api\src\modules\system\health.controller.ts >nul
if %errorlevel% equ 0 (
    echo [OK] Health endpoint configured
) else (
    echo [ERROR] Health endpoint missing
    exit /b 1
)

REM Test 4: Check Frontend API configuration
echo.
echo [4/5] Checking Frontend API configuration...
findstr /M "getApiBase" apps\web\lib\api.ts >nul
if %errorlevel% equ 0 (
    echo [OK] API base detection configured
) else (
    echo [ERROR] API base detection missing
    exit /b 1
)

REM Test 5: Check Render/Vercel configs
echo.
echo [5/5] Checking deployment configurations...
if exist "render.yaml" if exist "vercel.json" (
    echo [OK] Both deployment configs exist
    echo   - render.yaml (Render API)
    echo   - vercel.json (Vercel Frontend)
) else (
    echo [ERROR] Deployment configs missing
    exit /b 1
)

echo.
echo ==========================================
echo All checks passed!
echo ==========================================

echo.
echo Next Steps:
echo 1. Set NEXT_PUBLIC_API_BASE_URL in Vercel environment variables
echo 2. Recreate Render service with Node runtime (if needed)
echo 3. Run locally to test:
echo    Terminal 1: npm run start:api
echo    Terminal 2: npm run start:web
echo 4. Visit: http://localhost:3003/signup
echo.
pause
