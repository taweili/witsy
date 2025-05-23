
# Detect the system architecture
$architecture = $Env:PROCESSOR_ARCHITECTURE.ToLower()
if ($architecture -eq "amd64") { $architecture = "x64" }
Write-Host "Detected architecture: $architecture"

# Remove directories based on architecture
If (Test-Path "out/*win32-$architecture*") {
  Remove-Item -Recurse -Force "out/*win32-$architecture*"
}
If (Test-Path "out/make/zip/win32/$architecture/*") {
  Remove-Item -Recurse -Force "out/make/zip/win32/$architecture/*"
}
If (Test-Path "out/make/squirrel.windows/$architecture/*") {
  Remove-Item -Recurse -Force "out/make/squirrel.windows/$architecture/*"
}

# Read the build number from the file
$build_number_file = "./build/build_number.txt"
$build_number = Get-Content $build_number_file
$env:BUILD_NUMBER = $build_number
Write-Host "Build number: $build_number"

# Extract version from package.json
$packageJsonContent = Get-Content -Raw -Path "package.json"
$version = ($packageJsonContent | ConvertFrom-Json).version
Write-Host "Version: $version"

# Make sure prebuilds are used
$env:PREBUILDS_ONLY = "1"

# Run the electron-forge package command with architecture
npx electron-forge make -p win32 -a $architecture

# Rename the installer file
Rename-Item -Path "out\make\squirrel.windows\$architecture\Witsy-$version Setup.exe" -NewName "Witsy-$version-win32-$architecture.Setup.exe"
Rename-Item -Path "out\make\squirrel.windows\$architecture\witsy-$version-full.nupkg" -NewName "witsy-$version-win32-$architecture-full.nupkg"

# Replace name in RELEASES too
(Get-Content "out\make\squirrel.windows\$architecture\RELEASES").Replace("$version", "$version-win32-$architecture") | Set-Content "out\make\squirrel.windows\$architecture\RELEASES"

# Rename the zip file
Rename-Item -Path "out\make\zip\win32\$architecture\Witsy-win32-$architecture-$version.zip" -NewName "Witsy-$version-win32-$architecture.zip"
