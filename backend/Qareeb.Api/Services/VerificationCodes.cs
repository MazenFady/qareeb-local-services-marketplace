using System.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using Qareeb.Api.Domain;

namespace Qareeb.Api.Services;

// Storage primitive only. No delivery or unauthenticated verification endpoint.
// Callers must authorize appointment ownership, serialize attempts and persist changes.
public static class VerificationCodes
{
    private static readonly PasswordHasher<BookingVerificationCode> Hasher = new();
    public static (BookingVerificationCode Record, string Plaintext) Issue(Guid appointmentId, DateTimeOffset now)
    {
        // 128 random bits; avoids the offline brute-force exposure of short PINs.
        var plaintext = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));
        var record = new BookingVerificationCode { AppointmentId = appointmentId, ExpiresAt = now.AddMinutes(15) };
        record.CodeHash = Hasher.HashPassword(record, appointmentId.ToString("N") + ":" + plaintext);
        return (record, plaintext);
    }

    public static bool Consume(BookingVerificationCode record, string plaintext, DateTimeOffset now)
    {
        if (record.ConsumedAt is not null || record.ExpiresAt <= now || record.FailedAttempts >= 5) return false;
        if (plaintext.Length > 128 || Hasher.VerifyHashedPassword(record, record.CodeHash,
            record.AppointmentId.ToString("N") + ":" + plaintext) == PasswordVerificationResult.Failed)
        { record.FailedAttempts++; return false; }
        record.ConsumedAt = now;
        return true;
    }
}
