#!/usr/bin/env bash
set -u

cd "$(dirname "$0")"

echo ""
echo "  餐边柜 SKU Studio · 本地工作台"
echo "  ────────────────────────────────────"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  [缺少 Node.js]"
  echo ""
  echo "  请先安装 Node.js 18 或更高版本：https://nodejs.org/"
  echo "  安装完成后，重新运行本脚本。"
  echo ""
  exit 1
fi

echo "  Node.js $(node -v)"
echo "  正在启动本地服务并打开编辑器..."
echo ""

OPEN_FLAG="--open"
if [ "${1:-}" = "--no-open" ]; then
  OPEN_FLAG="--no-open"
fi

exec node server/server.js "$OPEN_FLAG"
