$ErrorActionPreference = 'Stop'
$themeRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$themeFolders = @('assets','config','layout','locales','sections','snippets','templates')
$sourceImages = @('assets/hero-1.png','assets/hero-2.png','assets/hero-3.png','assets/story.png','assets/detail.png')
$outputFolder = Join-Path $themeRoot 'dist'
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$archive = Join-Path $outputFolder 'eloir-theme.zip'
$temporaryArchive = Join-Path ([System.IO.Path]::GetTempPath()) ('eloir-' + [guid]::NewGuid().ToString() + '.zip')
$zipStream = [System.IO.File]::Open($temporaryArchive, [System.IO.FileMode]::CreateNew)
$zipWriter = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($themeFolder in $themeFolders) {
        foreach ($themeFile in Get-ChildItem -LiteralPath (Join-Path $themeRoot $themeFolder) -Recurse -File) {
            # ZIP paths must use forward slashes, including on Windows. Compress-Archive
            # writes backslashes on Windows PowerShell, which Shopify does not recognize.
            $entryName = $themeFile.FullName.Substring($themeRoot.Length + 1).Replace('\', '/')
            if ($sourceImages -contains $entryName) { continue }
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipWriter, $themeFile.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
} finally {
    $zipWriter.Dispose()
    $zipStream.Dispose()
}
$zipReader = [System.IO.Compression.ZipFile]::OpenRead($temporaryArchive)
try {
    $entryNames = @($zipReader.Entries | ForEach-Object { $_.FullName })
    foreach ($requiredEntry in @('layout/theme.liquid','config/settings_schema.json','templates/index.json')) {
        if ($entryNames -cnotcontains $requiredEntry) { throw "Missing exact ZIP entry: $requiredEntry" }
    }
    foreach ($entryName in $entryNames) {
        if ($entryName.Contains('\') -or $entryName -notmatch '^(assets|config|layout|locales|sections|snippets|templates)/') {
            throw "Invalid Shopify ZIP path: $entryName"
        }
    }
} finally { $zipReader.Dispose() }
Move-Item -LiteralPath $temporaryArchive -Destination $archive -Force
Write-Output $archive
