using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Qareeb.Api.Data;

public static class LocalDatabase
{
    public static string Connection()
    {
        var value = Environment.GetEnvironmentVariable("QAREEB_DB_CONNECTION")
            ?? throw new InvalidOperationException("Set QAREEB_DB_CONNECTION for a new Qareeb local development database.");
        var b = new SqlConnectionStringBuilder(value);
        if (!b.DataSource.Equals(@"(localdb)\MSSQLLocalDB", StringComparison.OrdinalIgnoreCase)
            || !System.Text.RegularExpressions.Regex.IsMatch(b.InitialCatalog, @"^Qareeb_Development_[A-Za-z0-9_]+$")
            || !b.IntegratedSecurity || b.UserID.Length > 0 || b.Password.Length > 0
            || b.AttachDBFilename.Length > 0)
            throw new InvalidOperationException("Only Qareeb_Development_* on MSSQLLocalDB with integrated security is allowed.");
        return b.ConnectionString;
    }

    // Intentionally refuses existing databases. No drop/reset/automatic upgrade path.
    public static async Task CreateNewAsync(string connection, string repositoryRoot)
    {
        var b = new SqlConnectionStringBuilder(connection);
        var name = b.InitialCatalog;
        b.InitialCatalog = "master";
        await using var sql = new SqlConnection(b.ConnectionString);
        await sql.OpenAsync();
        await using var check = new SqlCommand("SELECT COUNT(*) FROM sys.databases WHERE name = @name", sql);
        check.Parameters.AddWithValue("@name", name);
        if ((int)(await check.ExecuteScalarAsync())! != 0)
            throw new InvalidOperationException("Database already exists. Choose a new development name; existing databases are never reset.");
        var directory = Path.GetFullPath(Path.Combine(repositoryRoot, ".local", "databases"));
        Directory.CreateDirectory(directory);
        var data = Path.Combine(directory, name + ".mdf");
        var log = Path.Combine(directory, name + "_log.ldf");
        if (File.Exists(data) || File.Exists(log)) throw new InvalidOperationException("Database files already exist.");
        static string Quote(string value) => value.Replace("'", "''");
        await using var create = new SqlCommand(
            $"CREATE DATABASE [{name}] ON (NAME = N'{name}', FILENAME = N'{Quote(data)}') LOG ON (NAME = N'{name}_log', FILENAME = N'{Quote(log)}')", sql);
        await create.ExecuteNonQueryAsync();
    }
}

public class DesignFactory : IDesignTimeDbContextFactory<QareebDbContext>
{
    public QareebDbContext CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<QareebDbContext>().UseSqlServer(LocalDatabase.Connection()).Options);
}
