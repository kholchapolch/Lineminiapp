$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($env:AZURE_WEBAPP_PUBLISH_PROFILE)) {
  throw "AZURE_WEBAPP_PUBLISH_PROFILE is required."
}

[xml]$publishData = $env:AZURE_WEBAPP_PUBLISH_PROFILE
$profile = @($publishData.publishData.publishProfile) |
  Where-Object { $_.publishMethod -eq "MSDeploy" } |
  Select-Object -First 1

if ($null -eq $profile) {
  $profile = @($publishData.publishData.publishProfile) |
    Where-Object { $_.publishMethod -eq "ZipDeploy" } |
    Select-Object -First 1
}

if ($null -eq $profile) {
  throw "Publish profile has no MSDeploy or ZipDeploy entry."
}

$scmHost = ([string]$profile.publishUrl) -replace '^https?://', ''
$scmHost = ($scmHost -split '/')[0] -replace ':443$', ''
$scmBaseUrl = "https://$scmHost"
$credentialBytes = [System.Text.Encoding]::ASCII.GetBytes(
  "$($profile.userName):$($profile.userPWD)"
)
$headers = @{
  Authorization = "Basic $([Convert]::ToBase64String($credentialBytes))"
}
$siteRoot = "D:\home\site\wwwroot"
$remoteRoot = ".prod-seed-once-20260818"
$uploadFiles = @(
  @{ Source = "scripts/db/mysql-connection.mjs"; Destination = "$remoteRoot/db/mysql-connection.mjs" },
  @{ Source = "scripts/db/seed-module.mjs"; Destination = "$remoteRoot/db/seed-module.mjs" },
  @{ Source = "scripts/db/audit-prod-seed.mjs"; Destination = "$remoteRoot/db/audit-prod-seed.mjs" },
  @{ Source = "scripts/db/migrate.mjs"; Destination = "$remoteRoot/db/migrate.mjs" },
  @{ Source = "scripts/db/seed.mjs"; Destination = "$remoteRoot/db/seed.mjs" },
  @{ Source = "scripts/db/verify.mjs"; Destination = "$remoteRoot/db/verify.mjs" },
  @{ Source = "scripts/db/prod/seed-data.mjs"; Destination = "$remoteRoot/db/prod/seed-data.mjs" }
)

function Invoke-KuduCommand {
  param([Parameter(Mandatory = $true)][string]$Command)

  $body = @{
    command = $Command
    dir = $siteRoot
  } | ConvertTo-Json
  $result = Invoke-RestMethod `
    -Uri "$scmBaseUrl/api/command" `
    -Method Post `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body

  if (-not [string]::IsNullOrWhiteSpace([string]$result.Output)) {
    Write-Host ([string]$result.Output).TrimEnd()
  }

  if ([int]$result.ExitCode -ne 0) {
    $errorOutput = ([string]$result.Error).Trim()
    throw "Kudu command failed with exit code $($result.ExitCode): $errorOutput"
  }

  return [string]$result.Output
}

function ConvertTo-KuduPath {
  param([Parameter(Mandatory = $true)][string]$RelativePath)

  return (($RelativePath -split '/') |
    ForEach-Object { [Uri]::EscapeDataString($_) }) -join '/'
}

try {
  Invoke-KuduCommand `
    "powershell -NoProfile -NonInteractive -Command `"New-Item -ItemType Directory -Force -Path '$remoteRoot\db\prod' | Out-Null`"" |
    Out-Null

  foreach ($file in $uploadFiles) {
    if (-not (Test-Path -LiteralPath $file.Source -PathType Leaf)) {
      throw "Required seed file is missing: $($file.Source)"
    }

    $kuduPath = ConvertTo-KuduPath $file.Destination
    Invoke-RestMethod `
      -Uri "$scmBaseUrl/api/vfs/site/wwwroot/$kuduPath" `
      -Method Put `
      -Headers ($headers + @{ "If-Match" = "*" }) `
      -ContentType "application/octet-stream" `
      -InFile $file.Source |
      Out-Null
  }

  $auditOutput = Invoke-KuduCommand (
    "node --env-file=.env.production " +
    "$remoteRoot/db/audit-prod-seed.mjs --seed ./prod/seed-data.mjs"
  )
  $auditLine = ($auditOutput -split "`r?`n") |
    Where-Object { $_.StartsWith("PROD_SEED_AUDIT=") } |
    Select-Object -Last 1

  if ([string]::IsNullOrWhiteSpace($auditLine)) {
    throw "PROD seed audit marker was not returned."
  }

  $audit = $auditLine.Substring("PROD_SEED_AUDIT=".Length) |
    ConvertFrom-Json

  switch ([string]$audit.status) {
    "already_seeded" {
      Write-Host "PROD seed already matches expected version and counts. No mutation performed."
    }
    "safe_to_seed" {
      Write-Host "PROD badge tables are absent or empty. Applying one-time seed."
      Invoke-KuduCommand `
        "node --env-file=.env.production $remoteRoot/db/migrate.mjs" |
        Out-Null
      Invoke-KuduCommand (
        "node --env-file=.env.production " +
        "$remoteRoot/db/seed.mjs --seed ./prod/seed-data.mjs"
      ) | Out-Null
      Invoke-KuduCommand (
        "node --env-file=.env.production " +
        "$remoteRoot/db/verify.mjs --seed ./prod/seed-data.mjs"
      ) | Out-Null
      Write-Host "PROD one-time seed completed and verified."
    }
    default {
      throw (
        "Refusing to seed: PROD badge tables contain unexpected data. " +
        "Audit status=$($audit.status)."
      )
    }
  }
}
finally {
  $cleanupCommand = (
    "powershell -NoProfile -NonInteractive -Command `"" +
    "Remove-Item -LiteralPath '$remoteRoot' -Recurse -Force -ErrorAction SilentlyContinue" +
    "`""
  )

  try {
    Invoke-KuduCommand $cleanupCommand | Out-Null
  }
  catch {
    Write-Warning "Could not remove temporary seed files: $($_.Exception.Message)"
  }
}
