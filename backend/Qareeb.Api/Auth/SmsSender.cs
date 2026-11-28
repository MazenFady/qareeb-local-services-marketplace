using Microsoft.AspNetCore.DataProtection;

namespace Qareeb.Api.Auth;

public interface ISmsSender
{
    Task SendAsync(Guid challengeId, string phone, string code);
}

public sealed class DisabledSmsSender : ISmsSender
{
    public Task SendAsync(Guid challengeId, string phone, string code) =>
        throw new AuthFailure("SMS delivery is not configured.", 503);
}

// No HTTP read endpoint and no console/log output. Explicit local operator CLI only.
public sealed class DevelopmentSmsSender(IWebHostEnvironment environment, IDataProtectionProvider protection) : ISmsSender
{
    private readonly IDataProtector protector = protection.CreateProtector("Qareeb.DevelopmentSms.v1");
    private string PathFor(Guid id)
    {
        if (!environment.IsDevelopment()) throw new InvalidOperationException("Local SMS is Development-only.");
        var directory = Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "..", ".local", "sms"));
        Directory.CreateDirectory(directory);
        return Path.Combine(directory, id + ".protected");
    }
    public Task SendAsync(Guid challengeId, string phone, string code) =>
        File.WriteAllTextAsync(PathFor(challengeId), protector.Protect(code));
    public string Read(Guid id) => protector.Unprotect(File.ReadAllText(PathFor(id)));
}
