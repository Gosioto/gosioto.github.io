$content = Get-Content 'src/data/tradedamage.ts'
$newContent = @()

foreach ($line in $content) {
    if ($line -match "description: '([^']*)'$") {
        $newContent += $line + ","
    } else {
        $newContent += $line
    }
}

$newContent | Set-Content 'src/data/tradedamage.ts'
