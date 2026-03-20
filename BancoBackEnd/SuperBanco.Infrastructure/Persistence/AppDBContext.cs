using Microsoft.EntityFrameworkCore;
using SuperBanco.Domain.Entities;

namespace SuperBanco.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<CuentaAhorros> CuentasAhorros => Set<CuentaAhorros>();
    public DbSet<Movimiento> Movimientos => Set<Movimiento>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Cliente
        modelBuilder.Entity<Cliente>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Email).IsRequired().HasMaxLength(200);
            e.HasIndex(c => c.Email).IsUnique();
            e.Property(c => c.Nombre).IsRequired().HasMaxLength(100);
            e.Property(c => c.Apellido).IsRequired().HasMaxLength(100);
            e.Property(c => c.PasswordHash).IsRequired();
        });

        // CuentaAhorros
        modelBuilder.Entity<CuentaAhorros>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.NumeroCuenta).IsRequired().HasMaxLength(20);
            e.HasIndex(c => c.NumeroCuenta).IsUnique();
            e.Property(c => c.Saldo).HasPrecision(18, 2);
            e.HasOne(c => c.Cliente)
             .WithMany(cl => cl.Cuentas)
             .HasForeignKey(c => c.ClienteId);
        });

        // Movimiento
        modelBuilder.Entity<Movimiento>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Monto).HasPrecision(18, 2);
            e.Property(m => m.SaldoAnterior).HasPrecision(18, 2);
            e.Property(m => m.SaldoPosterior).HasPrecision(18, 2);
            e.HasOne(m => m.CuentaAhorros)
             .WithMany(c => c.Movimientos)
             .HasForeignKey(m => m.CuentaAhorrosId);
        });
    }
}