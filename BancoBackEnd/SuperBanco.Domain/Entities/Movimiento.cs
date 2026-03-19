namespace SuperBanco.Domain.Entities;

public enum TipoMovimiento
{
    Deposito,
    Retiro,
    TransferenciaEntrada,
    TransferenciaSalida
}

public class Movimiento
{
    public Guid Id { get; set; }
    public decimal Monto { get; set; }
    public TipoMovimiento Tipo { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public decimal SaldoAnterior { get; set; }
    public decimal SaldoPosterior { get; set; }

    // Relación con CuentaAhorros
    public Guid CuentaAhorrosId { get; set; }
    public CuentaAhorros CuentaAhorros { get; set; } = null!;
}