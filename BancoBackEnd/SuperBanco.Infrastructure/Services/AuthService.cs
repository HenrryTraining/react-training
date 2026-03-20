using Microsoft.EntityFrameworkCore;
using SuperBanco.Application.DTOs.Auth;
using SuperBanco.Application.Interfaces;
using SuperBanco.Domain.Entities;
using SuperBanco.Infrastructure.Persistence;

namespace SuperBanco.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public AuthService(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<string> RegisterAsync(RegisterDto dto)
    {
        // Verificar si el email ya existe
        var existe = await _context.Clientes
            .AnyAsync(c => c.Email == dto.Email);

        if (existe)
            throw new Exception("El email ya está registrado.");

        // Crear token de verificación
        var tokenVerificacion = Guid.NewGuid().ToString();

        var cliente = new Cliente
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            EmailVerificado = false,
            TokenVerificacion = tokenVerificacion,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        // En producción aquí enviarías el email
        // Por ahora retornamos el token directamente para pruebas
        return $"Registro exitoso. Token de verificación: {tokenVerificacion}";
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.Email == dto.Email);

        if (cliente is null)
            throw new Exception("Credenciales inválidas.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, cliente.PasswordHash))
            throw new Exception("Credenciales inválidas.");

        if (!cliente.EmailVerificado)
            throw new Exception("Debes verificar tu email antes de iniciar sesión.");

        var token = _jwtService.GenerarToken(cliente);

        return new AuthResponseDto
        {
            Token = token,
            Email = cliente.Email,
            NombreCompleto = $"{cliente.Nombre} {cliente.Apellido}",
            Expiracion = DateTime.UtcNow.AddHours(24)
        };
    }

    public async Task<string> VerifyEmailAsync(string token)
    {
        var cliente = await _context.Clientes
            .FirstOrDefaultAsync(c => c.TokenVerificacion == token);

        if (cliente is null)
            throw new Exception("Token de verificación inválido.");

        cliente.EmailVerificado = true;
        cliente.TokenVerificacion = null;

        await _context.SaveChangesAsync();

        return "Email verificado correctamente. Ya puedes iniciar sesión.";
    }
}