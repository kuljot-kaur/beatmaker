param(
  [int]$BackendPort = 8080
)

Write-Host "Starting backend..."
$mvn = Start-Process -FilePath mvn -ArgumentList 'spring-boot:run' -NoNewWindow -PassThru

# wait for port to be open
function Wait-ForPort($port, $timeoutSeconds=30){
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while($sw.Elapsed.TotalSeconds -lt $timeoutSeconds){
    try{ $tcp = New-Object System.Net.Sockets.TcpClient('127.0.0.1',$port); $tcp.Close(); return $true }catch{ Start-Sleep -Milliseconds 500 }
  }
  return $false
}

if(!(Wait-ForPort -port $BackendPort -timeoutSeconds 30)){
  Write-Error "Backend did not start on port $BackendPort"
  exit 1
}

Write-Host "Backend is up. Running integration test..."
Push-Location -Path (Join-Path $PSScriptRoot '..')
Set-Location -Path (Join-Path $PWD.Path 'integration')
npm install
npm run test-stomp
$exitCode = $LASTEXITCODE
Pop-Location

Write-Host "Stopping backend..."
$mvn | Stop-Process -Force

exit $exitCode
