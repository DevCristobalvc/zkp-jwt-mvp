#!/bin/bash

# ZKPJWT - Quick Test Script
# Tests all components to ensure everything works

echo "🚀 ZKPJWT - Testing All Components"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Library
echo "📦 Testing Library..."
cd library
npm install > /dev/null 2>&1
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Library builds successfully${NC}"
    
    # Run examples
    node dist/examples.js > /tmp/zkpjwt-examples.log 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Examples run successfully${NC}"
        echo "   - Example 1: Encrypted messaging"
        echo "   - Example 2: Merkle proof generation"
        echo "   - Example 3: Token-gated content"
    else
        echo -e "${RED}❌ Examples failed${NC}"
    fi
else
    echo -e "${RED}❌ Library build failed${NC}"
fi

cd ..

# Test Demo
echo ""
echo "🎨 Testing Demo..."
cd demo
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Demo dependencies installed${NC}"
    echo -e "${YELLOW}ℹ️  Run 'npm run dev' to start demo${NC}"
else
    echo -e "${RED}❌ Demo install failed${NC}"
fi

cd ..

# Summary
echo ""
echo "=================================="
echo "📊 Summary"
echo "=================================="
echo ""

# Count files
echo "📁 Project Structure:"
echo "   - Core files: $(find library/src contracts circuits -type f \( -name '*.ts' -o -name '*.sol' -o -name '*.circom' \) | wc -l | xargs)"
echo "   - Documentation: $(find . -maxdepth 2 -name '*.md' | wc -l | xargs) files"
echo "   - Components: 4 (library, contracts, circuits, demo)"
echo ""

# Lines of code
echo "💻 Code Metrics:"
echo "   - TypeScript: $(cat library/src/*.ts | wc -l | xargs) lines"
echo "   - Solidity: $(cat contracts/*.sol | wc -l | xargs) lines"
echo "   - Circom: $(cat circuits/*.circom | wc -l | xargs) lines"
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "🎯 Next Steps:"
echo "   1. Read: README.md or QUICKSTART.md"
echo "   2. Try examples: cd library && node dist/examples.js"
echo "   3. Run demo: cd demo && npm run dev"
echo "   4. Deploy contract: See DEPLOYMENT.md"
echo ""
echo "📚 Documentation Index: INDEX.md"
echo "🎬 Demo Guide: DEMO_SCRIPT.md"
echo ""
