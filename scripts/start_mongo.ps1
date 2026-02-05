$ErrorActionPreference = "Stop"

function Test-Admin {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

Write-Output "Orbix Team Navigator - Database Diagnostics"
Write-Output "---------------------------------------------"

if (-not (Test-Admin)) {
    Write-Output "Warning: Script is not running as Administrator."
    Write-Output "   Attempting to start MongoDB service requires Admin rights."
    Write-Output "   If this fails, please run this script in an Admin PowerShell."
}

# 1. Try to start the Windows Service
try {
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Output "Found MongoDB Service ('$($service.DisplayName)')."
        if ($service.Status -eq 'Running') {
            Write-Output "Service is already RUNNING."
            exit 0
        }
        
        Write-Output "Attempting to start MongoDB Service..."
        Start-Service -Name "MongoDB"
        Write-Output "Service STARTED successfully."
        exit 0
    }
    else {
        Write-Output "MongoDB Service NOT FOUND."
    }
}
catch {
    Write-Output "Failed to start service: $($_.Exception.Message)"
}

# 2. Fallback: Try to find mongod.exe and run locally
Write-Output "Falling back to manual startup..."

$possiblePaths = @(
    "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe",
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
)

$mongodPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $mongodPath = $path
        break
    }
}

if (-not $mongodPath) {
    Write-Output "Could not locate 'mongod.exe' in standard directories."
    Write-Output "Please install MongoDB or add it to your PATH."
    exit 1
}

Write-Output "Found mongod at: $mongodPath"

# 3. Setup local data directory if needed
$localDataPath = Join-Path $PSScriptRoot "..\data\db"
if (-not (Test-Path $localDataPath)) {
    Write-Output "Creating local data directory at: $localDataPath"
    New-Item -ItemType Directory -Path $localDataPath -Force | Out-Null
}

Write-Output "Starting local MongoDB instance..."
Write-Output "   Data Path: $localDataPath"
Write-Output "   Port: 27017"

try {
    # Start mongod process in a new window to keep it running
    Start-Process -FilePath $mongodPath -ArgumentList "--dbpath", $localDataPath, "--port", "27017"
    Write-Output "MongoDB started locally in a new window."
}
catch {
    Write-Output "Failed to start local mongod: $($_.Exception.Message)"
}
