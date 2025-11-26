# PowerShell script to copy ML models from source directory

$sourcePath = "..\..\Personalized-Health-and-Fitness-Recommendation-System\Pycharm Files"
$destPath = "."

Write-Host "Copying ML models from $sourcePath to $destPath..." -ForegroundColor Cyan

# Check if source directory exists
if (!(Test-Path $sourcePath)) {
    Write-Host "Error: Source directory not found: $sourcePath" -ForegroundColor Red
    exit 1
}

# Copy model files
$files = @(
    "rf_diet_model.pkl",
    "rf_exercises_model.pkl",
    "label_encoders.pkl"
)

foreach ($file in $files) {
    $sourceFile = Join-Path $sourcePath $file
    $destFile = Join-Path $destPath $file
    
    if (Test-Path $sourceFile) {
        Copy-Item $sourceFile $destFile -Force
        Write-Host "✓ Copied $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! ML models copied successfully." -ForegroundColor Green
Write-Host "You can now run: python app.py" -ForegroundColor Cyan

