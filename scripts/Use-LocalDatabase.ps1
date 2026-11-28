param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^Qareeb_Development_[A-Za-z0-9_]+$')]
    [string]$DatabaseName
)

# Dot-source this script to configure the current terminal. No credentials or
# connection strings are written to disk or printed.
$qareebConnection = New-Object System.Data.SqlClient.SqlConnectionStringBuilder
$qareebConnection['Data Source'] = '(localdb)\MSSQLLocalDB'
$qareebConnection['Initial Catalog'] = $DatabaseName
$qareebConnection['Integrated Security'] = $true
$qareebConnection['Encrypt'] = $true
$qareebConnection['TrustServerCertificate'] = $true
$env:QAREEB_DB_CONNECTION = $qareebConnection.ConnectionString
$env:ASPNETCORE_ENVIRONMENT = 'Development'
Write-Output 'Configured the current terminal for Qareeb LocalDB development.'
