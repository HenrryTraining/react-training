namespace SuperBanco.Domain.Entities;

public class CuentaAhorros
{
    public Guid Id { get; set; }
    public string NumeroCuenta { get; set; } = string.Empty;
    public decimal Saldo { get; set; } = 0;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public bool Activa { get; set; } = true;

    // Relación con Cliente
    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;

    // Navegación
    public ICollection<Movimiento> Movimientos { get; set; } = new List<Movimiento>();
}