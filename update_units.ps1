$content = Get-Content 'src/data/tradedamage.ts'
$newContent = @()

foreach ($line in $content) {
    $newContent += $line
    if ($line -match "description: '[^']*'$") {
        $newContent += "    uniqueness: 70,"
        $newContent += "    power: 75,"
        $newContent += "    specialty: 'урон',"
        $newContent += "    enhancement: 'Увеличить базовый урон'"
    }
}

$newContent | Set-Content 'src/data/tradedamage.ts'
