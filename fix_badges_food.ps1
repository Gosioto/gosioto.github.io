$content = Get-Content 'src/data/tradedamage.ts'
$newContent = @()
$inBadges = $false
$inFood = $false

foreach ($line in $content) {
    if ($line -match "export const badges") {
        $inBadges = $true
        $newContent += $line
    } elseif ($line -match "export const food") {
        $inBadges = $false
        $inFood = $true
        $newContent += $line
    } elseif ($line -match "export const") {
        $inBadges = $false
        $inFood = $false
        $newContent += $line
    } elseif (($inBadges -or $inFood) -and ($line -match "uniqueness|power|specialty|enhancement")) {
        # Skip these lines in badges and food sections
        continue
    } else {
        $newContent += $line
    }
}

$newContent | Set-Content 'src/data/tradedamage.ts'
