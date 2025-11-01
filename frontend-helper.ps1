# 🚀 Frontend Setup & Deploy Helper

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Frontend Deployment Helper" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Select an option:" -ForegroundColor Yellow
    Write-Host "1. Install dependencies"
    Write-Host "2. Run development server"
    Write-Host "3. Build for production"
    Write-Host "4. Test Docker build locally"
    Write-Host "5. Deploy to Cloud Run (via GitHub)"
    Write-Host "6. Check Cloud Run status"
    Write-Host "7. View Cloud Run logs"
    Write-Host "8. Exit"
    Write-Host ""
}

function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Green
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

function Start-Dev {
    Write-Host "Starting development server..." -ForegroundColor Green
    Set-Location frontend
    npm run dev
    Set-Location ..
}

function Build-Production {
    Write-Host "Building for production..." -ForegroundColor Green
    Set-Location frontend
    npm run build
    Set-Location ..
    Write-Host "✅ Build completed! Check frontend/dist/" -ForegroundColor Green
}

function Test-DockerBuild {
    Write-Host "Testing Docker build..." -ForegroundColor Green
    Set-Location frontend
    docker build -t frontend-test .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker build successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To run the container:" -ForegroundColor Yellow
        Write-Host "docker run -p 8080:8080 -e VITE_API_URL=http://localhost:8000 frontend-test"
    } else {
        Write-Host "❌ Docker build failed!" -ForegroundColor Red
    }
    Set-Location ..
}

function Deploy-ToCloudRun {
    Write-Host "Deploying to Cloud Run via GitHub Actions..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Make sure you have committed all your changes!" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Do you want to push to GitHub now? (y/n)"
    if ($confirm -eq 'y') {
        git add .
        $message = Read-Host "Enter commit message"
        git commit -m "$message"
        git push origin main
        Write-Host ""
        Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
        Write-Host "📊 Monitor the deployment at: https://github.com/Vit537/Ecommerce/actions" -ForegroundColor Cyan
    }
}

function Check-CloudRunStatus {
    Write-Host "Checking Cloud Run status..." -ForegroundColor Green
    gcloud run services describe ecommerce-frontend --region us-central1 --format="table(status.url,status.conditions)"
}

function View-CloudRunLogs {
    Write-Host "Viewing Cloud Run logs..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    gcloud run services logs tail ecommerce-frontend --region us-central1
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-8)"
    Write-Host ""
    
    switch ($choice) {
        '1' { Install-Dependencies }
        '2' { Start-Dev }
        '3' { Build-Production }
        '4' { Test-DockerBuild }
        '5' { Deploy-ToCloudRun }
        '6' { Check-CloudRunStatus }
        '7' { View-CloudRunLogs }
        '8' { 
            Write-Host "Goodbye! 👋" -ForegroundColor Cyan
            exit 
        }
        default { Write-Host "Invalid option, please try again." -ForegroundColor Red }
    }
    
    Write-Host ""
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
} while ($true)
