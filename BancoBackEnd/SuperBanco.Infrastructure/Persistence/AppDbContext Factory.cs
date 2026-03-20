using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SuperBanco.Infrastructure.Persistence;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=localhost\\MSSQL2025;Database=SuperBancoDB;User Id=sa;Password=Admin1234!;TrustServerCertificate=True;")
            .Options;

        return new AppDbContext(options);
    }
}