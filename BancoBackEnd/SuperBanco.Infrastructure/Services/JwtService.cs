using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SuperBanco.Domain.Entities;

namespace SuperBanco.Infrastructure.Services;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerarToken(Cliente cliente)
    {
        var secretKey = _config["JwtSettings:SecretKey"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, cliente.Id.ToString()),
            new Claim(ClaimTypes.Email, cliente.Email),
            new Claim(ClaimTypes.Name, $"{cliente.Nombre} {cliente.Apellido}")
        };

        var expiracion = DateTime.UtcNow.AddHours(
            double.Parse(_config["JwtSettings:ExpirationHours"]!));

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: expiracion,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}