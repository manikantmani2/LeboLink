#!/bin/bash
# Test Script for LeboLink Deployment

echo "=========================================="
echo "LeboLink Deployment Test"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if dependencies are installed
echo -e "\n${YELLOW}[1/5] Checking dependencies...${NC}"
if [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✓ package-lock.json exists${NC}"
else
    echo -e "${RED}✗ package-lock.json missing${NC}"
    exit 1
fi

# Test 2: Verify builds
echo -e "\n${YELLOW}[2/5] Building monorepo...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Test 3: Check API configuration
echo -e "\n${YELLOW}[3/5] Checking API configuration...${NC}"
if grep -q "GET /api/v1/health" apps/api/src/modules/system/health.controller.ts; then
    echo -e "${GREEN}✓ Health endpoint configured${NC}"
else
    echo -e "${RED}✗ Health endpoint missing${NC}"
    exit 1
fi

# Test 4: Check Frontend API configuration
echo -e "\n${YELLOW}[4/5] Checking Frontend API configuration...${NC}"
if grep -q "getApiBase" apps/web/lib/api.ts; then
    echo -e "${GREEN}✓ API base detection configured${NC}"
else
    echo -e "${RED}✗ API base detection missing${NC}"
    exit 1
fi

# Test 5: Check Render/Vercel configs
echo -e "\n${YELLOW}[5/5] Checking deployment configurations...${NC}"
if [ -f "render.yaml" ] && [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ Both deployment configs exist${NC}"
    echo -e "  - render.yaml (Render API)"
    echo -e "  - vercel.json (Vercel Frontend)"
else
    echo -e "${RED}✗ Deployment configs missing${NC}"
    exit 1
fi

echo -e "\n${GREEN}=========================================="
echo "All checks passed! ✓"
echo "=========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Set NEXT_PUBLIC_API_BASE_URL in Vercel environment variables"
echo "2. Recreate Render service with Node runtime (if needed)"
echo "3. Run locally to test:"
echo "   Terminal 1: npm run start:api"
echo "   Terminal 2: npm run start:web"
echo "4. Visit: http://localhost:3003/signup"
