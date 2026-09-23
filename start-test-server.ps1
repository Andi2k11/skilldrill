param(
    [int]$Port = 8000
)

# Serve current directory using Python's http.server (Python 3)
function Start-HttpServer {
    param($port)

    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) {
        $python = Get-Command python3 -ErrorAction SilentlyContinue
    }

    if (-not $python) {
        Write-Error "Python not found in PATH. Install Python 3 or update PATH."
        exit 1
    }

    Write-Output "Starting HTTP server on http://localhost:$port (press Ctrl+C to stop)"
    Start-Process -FilePath $python.Path -ArgumentList "-m", "http.server", "$port" -NoNewWindow -WorkingDirectory (Get-Location)
    Start-Sleep -Milliseconds 300
    Start-Process "http://localhost:$port"
}

Start-HttpServer -port $Port
