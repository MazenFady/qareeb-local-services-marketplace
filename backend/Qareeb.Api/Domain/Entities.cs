using Microsoft.AspNetCore.Identity;

namespace Qareeb.Api.Domain;

public static class Roles
{
    public const string Customer = "Customer";
    public const string Provider = "Provider";
    public const string Admin = "PlatformAdmin";
}

public class AppUser : IdentityUser<Guid>
{
    public string? TotpSecretProtected { get; set; }
    public string? NormalizedPhone { get; set; }
    public long LastTotpStep { get; set; } = -1;
    public string DisplayName { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class AuthenticationChallenge : Entity
{
    public Guid UserId { get; set; }
    public string Phone { get; set; } = "";
    public string Purpose { get; set; } = "";
    public string CodeHash { get; set; } = "";
    public string SecurityStamp { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
    public int Attempts { get; set; }
}

public abstract class Entity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public byte[] Version { get; set; } = [];
}

public class Category : Entity
{
    public string Slug { get; set; } = "";
    public string NameEn { get; set; } = "";
    public string NameAr { get; set; } = "";
}

public class ProviderProfile : Entity
{
    public Guid OwnerId { get; set; }
    public string NameEn { get; set; } = "";
    public string NameAr { get; set; } = "";
    public string BioEn { get; set; } = "";
    public string BioAr { get; set; } = "";
    public bool IsApproved { get; set; }
    public bool VacationMode { get; set; }
    // Review trail. IsApproved stays the single access gate; ReviewedAt marks a
    // rejection so a rejected application can be told apart from a pending one.
    public DateTimeOffset? ReviewedAt { get; set; }
    public Guid? ReviewedById { get; set; }
    public string? ReviewNote { get; set; }

    // Public discovery presentation. Contact links are explicit: an owner's
    // sign-in phone is never published by the catalog.
    public string? HeroImageUrl { get; set; }
    public string? AvatarImageUrl { get; set; }
    public string? GalleryJson { get; set; }
    public string? NeighborhoodEn { get; set; }
    public string? NeighborhoodAr { get; set; }
    public string? DistanceEn { get; set; }
    public string? DistanceAr { get; set; }
    public string? NextAvailableSlotEn { get; set; }
    public string? NextAvailableSlotAr { get; set; }
    public string? ContactPhone { get; set; }
    public string? WhatsAppNumber { get; set; }
    public string? InstagramHandle { get; set; }
    public string? FacebookPage { get; set; }
}

public class ProviderLocation : Entity
{
    public Guid ProviderId { get; set; }
    public string AddressEn { get; set; } = "";
    public string AddressAr { get; set; } = "";
    public string TimeZoneId { get; set; } = "Africa/Cairo";
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}

public class ProviderService : Entity
{
    public Guid ProviderId { get; set; }
    public Guid CategoryId { get; set; }
    public string TitleEn { get; set; } = "";
    public string TitleAr { get; set; } = "";
    public decimal Price { get; set; }
    public string Currency { get; set; } = "EGP";
    public int DurationMinutes { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ProviderStaff : Entity
{
    public Guid ProviderId { get; set; }
    public Guid? UserId { get; set; }
    public string NameEn { get; set; } = "";
    public string NameAr { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

// One daily interval per staff member/location. No row means closed.
public class WorkingHours : Entity
{
    public Guid ProviderId { get; set; }
    public Guid LocationId { get; set; }
    public Guid StaffId { get; set; }
    public DayOfWeek Day { get; set; }
    public TimeOnly OpensAt { get; set; }
    public TimeOnly ClosesAt { get; set; }
}

// UTC blocked interval for holidays, breaks and exceptional staff unavailability.
public class AvailabilityException : Entity
{
    public Guid ProviderId { get; set; }
    public Guid StaffId { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public string Reason { get; set; } = "";
}

public enum BookingStatus { Pending, Confirmed, Completed, Cancelled, Rejected }
public class Appointment : Entity
{
    public Guid CustomerId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid LocationId { get; set; }
    public Guid StaffId { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Confirmed;
    public string Currency { get; set; } = "EGP";
    public decimal TotalPrice { get; set; }
    public List<AppointmentService> Services { get; set; } = [];
}

public class AppointmentService : Entity
{
    public Guid AppointmentId { get; set; }
    public Guid ProviderId { get; set; }
    public Guid ServiceId { get; set; }
    public string TitleEn { get; set; } = "";
    public string TitleAr { get; set; } = "";
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
}

// Purpose-bound booking confirmation; never grants an identity or session.
public class BookingVerificationCode : Entity
{
    public Guid AppointmentId { get; set; }
    public string CodeHash { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
    public int FailedAttempts { get; set; }
}

public class Review : Entity
{
    public Guid AppointmentId { get; set; }
    public Guid AuthorId { get; set; }
    public int Rating { get; set; }
    public string Body { get; set; } = "";
    public string? ProviderReply { get; set; }
    public bool IsHidden { get; set; }
}

public enum ReportStatus { Open, Dismissed, Actioned }
public class ModerationReport : Entity
{
    public Guid ReviewId { get; set; }
    public Guid ReporterId { get; set; }
    public Guid? ResolvedById { get; set; }
    public string Reason { get; set; } = "";
    public string? Resolution { get; set; }
    public ReportStatus Status { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
}
