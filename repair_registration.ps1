$filePath = "src/features/organization/pages/Registration.tsx"
$lines = Get-Content -Path $filePath
# Sector 1: Identity Closures (1324-1330)
$lines[1323..1329] = @(
"                        ))}",
"                    </div>",
"                </div>",
"            )}",
"        </div>",
"    );"
)
# Sector 2: Auth Closure (1483)
$lines[1482] = "    );"
# Sector 3: Terminal Block (1580)
$lines[1579] = "    );"
$lines | Set-Content -Path $filePath -Encoding UTF8
Write-Host "Repair Complete."
