# PowerShell Launcher for Qareeb Prototype
Set-Location $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Starting Qareeb (قريب) Marketplace UI Prototype" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# Test if node is directly in path or via Electron
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if ($nodeCmd) {
    Start-Process "http://localhost:3000"
    & node server.js
} else {
    $indexPath = Join-Path $PSScriptRoot "index.html"
    Write-Host "Node not in PATH. Launching index.html directly in browser..." -ForegroundColor Green
    Start-Process $indexPath
}
