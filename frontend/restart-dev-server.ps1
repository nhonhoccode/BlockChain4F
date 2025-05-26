# PowerShell script to restart the development server

Write-Host "Stopping any existing npm processes..."
# Try to gracefully stop any existing npm processes
taskkill /fi "imagename eq node.exe" /f 2>$null

Write-Host "Starting development server..."
# Start the development server
npm run dev 