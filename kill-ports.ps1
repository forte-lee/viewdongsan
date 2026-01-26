# 포트를 사용 중인 프로세스 종료 스크립트
Write-Host "포트 3000-3003을 사용 중인 프로세스를 종료합니다..." -ForegroundColor Yellow

$ports = @(3000, 3001, 3002, 3003)

foreach ($port in $ports) {
    $connections = netstat -ano | findstr ":$port.*LISTENING"
    if ($connections) {
        $pid = ($connections -split '\s+')[-1]
        if ($pid -match '^\d+$') {
            Write-Host "포트 $port 사용 중인 프로세스 (PID: $pid) 종료 중..." -ForegroundColor Cyan
            taskkill /F /PID $pid 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 포트 $port 프로세스 종료 완료" -ForegroundColor Green
            } else {
                Write-Host "✗ 포트 $port 프로세스 종료 실패 (권한이 필요할 수 있습니다)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "포트 $port 사용 중인 프로세스 없음" -ForegroundColor Gray
    }
}

Write-Host "`n완료! 이제 npm run dev를 실행하세요." -ForegroundColor Green
