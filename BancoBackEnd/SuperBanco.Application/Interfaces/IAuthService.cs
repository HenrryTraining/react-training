using SuperBanco.Application.DTOs.Auth;

namespace SuperBanco.Application.Interfaces;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<string> VerifyEmailAsync(string token);
}