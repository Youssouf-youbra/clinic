using System;
using System.IO;
using Clinic.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Clinic.Api.Data;

// Permet à "dotnet ef" de construire le DbContext au moment des migrations
public class ClinicDbContextFactory : IDesignTimeDbContextFactory<ClinicDbContext>
{
    public ClinicDbContext CreateDbContext(string[] args)
    {
        // On lit la connexion depuis appsettings.Development.json (ou appsettings.json)
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<ClinicDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ClinicDbContext(optionsBuilder.Options);
    }
}
