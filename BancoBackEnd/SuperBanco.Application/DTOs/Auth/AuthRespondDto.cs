namespace SuperBanco.Application.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public DateTime Expiracion { get; set; }
}