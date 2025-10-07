$content = Get-Content 'src/data/tradedamage.ts'
$newContent = @()
$inScrolls = $false

foreach ($line in $content) {
    if ($line -match "export const scrolls") {
        $inScrolls = $true
        $newContent += $line
    } elseif ($line -match "export const badges") {
        $inScrolls = $false
        $newContent += $line
    } elseif ($inScrolls -and ($line -match "uniqueness|power|specialty|enhancement")) {
        # Skip these lines in scrolls section
        continue
    } else {
        $newContent += $line
    }
}

$newContent | Set-Content 'src/data/tradedamage.ts'
