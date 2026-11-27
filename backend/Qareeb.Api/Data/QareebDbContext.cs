using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Qareeb.Api.Domain;

namespace Qareeb.Api.Data;

public class QareebDbContext(DbContextOptions<QareebDbContext> options)
    : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ProviderProfile> Providers => Set<ProviderProfile>();
    public DbSet<ProviderLocation> Locations => Set<ProviderLocation>();
    public DbSet<ProviderService> Services => Set<ProviderService>();
    public DbSet<ProviderStaff> Staff => Set<ProviderStaff>();
    public DbSet<WorkingHours> Hours => Set<WorkingHours>();
    public DbSet<AvailabilityException> AvailabilityExceptions => Set<AvailabilityException>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentService> AppointmentServices => Set<AppointmentService>();
    public DbSet<BookingVerificationCode> VerificationCodes => Set<BookingVerificationCode>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ModerationReport> Reports => Set<ModerationReport>();
    public DbSet<AuthenticationChallenge> AuthenticationChallenges => Set<AuthenticationChallenge>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.Entity<AppUser>().Property(x => x.NormalizedPhone).HasMaxLength(16);
        b.Entity<AppUser>().HasIndex(x => x.NormalizedPhone).IsUnique().HasFilter("[NormalizedPhone] IS NOT NULL");
        b.Entity<AuthenticationChallenge>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId);
        b.Entity<AuthenticationChallenge>().HasIndex(x => new { x.Phone, x.Purpose, x.CreatedAt });
        b.Entity<AuthenticationChallenge>().ToTable(t => t.HasCheckConstraint("CK_AuthChallenge_Attempts", "[Attempts] BETWEEN 0 AND 5"));
        b.Entity<AppUser>().Property(x => x.DisplayName).HasMaxLength(200);
        b.Entity<Category>().HasIndex(x => x.Slug).IsUnique();
        b.Entity<ProviderProfile>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.OwnerId);
        b.Entity<ProviderLocation>().HasOne<ProviderProfile>().WithMany().HasForeignKey(x => x.ProviderId);
        b.Entity<ProviderLocation>().HasAlternateKey(x => new { x.Id, x.ProviderId });
        b.Entity<ProviderLocation>().Property(x => x.Latitude).HasPrecision(9, 6);
        b.Entity<ProviderLocation>().Property(x => x.Longitude).HasPrecision(9, 6);
        b.Entity<ProviderLocation>().ToTable(t => t.HasCheckConstraint("CK_Location_Coordinates",
            "([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL AND [Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180)"));
        b.Entity<ProviderService>().HasOne<ProviderProfile>().WithMany().HasForeignKey(x => x.ProviderId);
        b.Entity<ProviderService>().HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId);
        b.Entity<ProviderService>().HasAlternateKey(x => new { x.Id, x.ProviderId });
        b.Entity<ProviderService>().ToTable(t => t.HasCheckConstraint("CK_Service_PriceDuration", "[Price] >= 0 AND [DurationMinutes] BETWEEN 1 AND 1440"));
        b.Entity<ProviderStaff>().HasOne<ProviderProfile>().WithMany().HasForeignKey(x => x.ProviderId);
        b.Entity<ProviderStaff>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId);
        b.Entity<ProviderStaff>().HasAlternateKey(x => new { x.Id, x.ProviderId });
        b.Entity<WorkingHours>().HasOne<ProviderLocation>().WithMany().HasForeignKey(x => new { x.LocationId, x.ProviderId })
            .HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<WorkingHours>().HasOne<ProviderStaff>().WithMany().HasForeignKey(x => new { x.StaffId, x.ProviderId })
            .HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<WorkingHours>().HasIndex(x => new { x.StaffId, x.LocationId, x.Day }).IsUnique();
        b.Entity<WorkingHours>().ToTable(t => t.HasCheckConstraint("CK_Hours_Range", "[Day] BETWEEN 0 AND 6 AND [OpensAt] < [ClosesAt]"));
        b.Entity<AvailabilityException>().HasOne<ProviderStaff>().WithMany()
            .HasForeignKey(x => new { x.StaffId, x.ProviderId }).HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<AvailabilityException>().ToTable(t => t.HasCheckConstraint("CK_Exception_Range", "[StartsAt] < [EndsAt]"));
        b.Entity<Appointment>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.CustomerId);
        b.Entity<Appointment>().HasOne<ProviderStaff>().WithMany()
            .HasForeignKey(x => new { x.StaffId, x.ProviderId }).HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<Appointment>().HasOne<ProviderLocation>().WithMany()
            .HasForeignKey(x => new { x.LocationId, x.ProviderId }).HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<Appointment>().HasAlternateKey(x => new { x.Id, x.ProviderId });
        b.Entity<Appointment>().HasAlternateKey(x => new { x.Id, x.CustomerId });
        b.Entity<Appointment>().HasIndex(x => new { x.ProviderId, x.StaffId, x.StartsAt, x.EndsAt });
        b.Entity<Appointment>().Property(x => x.Status).HasConversion<string>();
        b.Entity<Appointment>().ToTable(t =>
        {
            t.HasTrigger("TR_Appointments_NoOverlap");
            t.UseSqlOutputClause(false);
            t.HasCheckConstraint("CK_Appointment_Range", "[StartsAt] < [EndsAt] AND [TotalPrice] >= 0");
            t.HasCheckConstraint("CK_Appointment_Status", "[Status] IN ('Pending','Confirmed','Completed','Cancelled','Rejected')");
        });
        b.Entity<AppointmentService>().HasOne<Appointment>().WithMany(x => x.Services)
            .HasForeignKey(x => new { x.AppointmentId, x.ProviderId }).HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<AppointmentService>().HasOne<ProviderService>().WithMany()
            .HasForeignKey(x => new { x.ServiceId, x.ProviderId }).HasPrincipalKey(x => new { x.Id, x.ProviderId });
        b.Entity<AppointmentService>().HasIndex(x => new { x.AppointmentId, x.ServiceId }).IsUnique();
        b.Entity<AppointmentService>().ToTable(t => t.HasCheckConstraint("CK_AppointmentService_Values", "[Price] >= 0 AND [DurationMinutes] BETWEEN 1 AND 1440"));
        b.Entity<BookingVerificationCode>().HasOne<Appointment>().WithMany().HasForeignKey(x => x.AppointmentId);
        b.Entity<BookingVerificationCode>().HasIndex(x => x.AppointmentId).IsUnique();
        b.Entity<BookingVerificationCode>().ToTable(t => t.HasCheckConstraint("CK_Verification_Attempts", "[FailedAttempts] BETWEEN 0 AND 5"));
        b.Entity<Review>().HasOne<Appointment>().WithMany()
            .HasForeignKey(x => new { x.AppointmentId, x.AuthorId }).HasPrincipalKey(x => new { x.Id, x.CustomerId });
        b.Entity<Review>().HasIndex(x => x.AppointmentId).IsUnique();
        b.Entity<Review>().ToTable(t => t.HasCheckConstraint("CK_Review_Rating", "[Rating] BETWEEN 1 AND 5"));
        b.Entity<ModerationReport>().HasOne<Review>().WithMany().HasForeignKey(x => x.ReviewId);
        b.Entity<ModerationReport>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.ReporterId);
        b.Entity<ModerationReport>().HasOne<AppUser>().WithMany().HasForeignKey(x => x.ResolvedById);
        b.Entity<ModerationReport>().Property(x => x.Status).HasConversion<string>();
        b.Entity<ModerationReport>().ToTable(t => t.HasCheckConstraint("CK_Report_Resolution",
            "([Status] = 'Open' AND [ResolvedAt] IS NULL AND [ResolvedById] IS NULL) OR ([Status] IN ('Dismissed','Actioned') AND [ResolvedAt] IS NOT NULL AND [ResolvedById] IS NOT NULL)"));

        foreach (var type in b.Model.GetEntityTypes())
        {
            foreach (var fk in type.GetForeignKeys()) fk.DeleteBehavior = DeleteBehavior.Restrict;
            if (!typeof(Entity).IsAssignableFrom(type.ClrType)) continue;
            b.Entity(type.ClrType).Property(nameof(Entity.Version)).IsRowVersion();
            foreach (var p in type.GetProperties())
            {
                if (p.ClrType == typeof(string))
                    p.SetMaxLength(p.Name is "Body" or "BioEn" or "BioAr" or "ProviderReply" or "Reason" or "Resolution" or "GalleryJson" ? 2000 : 256);
                if (p.ClrType == typeof(decimal)) { p.SetPrecision(18); p.SetScale(2); }
            }
        }
    }

    private void Stamp()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = now;
            if (entry.State is EntityState.Added or EntityState.Modified) entry.Entity.UpdatedAt = now;
            if (entry.State == EntityState.Modified) entry.Property(x => x.CreatedAt).IsModified = false;
        }
        foreach (var entry in ChangeTracker.Entries<AppUser>())
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = now;
            if (entry.State is EntityState.Added or EntityState.Modified) entry.Entity.UpdatedAt = now;
            if (entry.State == EntityState.Modified) entry.Property(x => x.CreatedAt).IsModified = false;
        }
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess) { Stamp(); return base.SaveChanges(acceptAllChangesOnSuccess); }
    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    { Stamp(); return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken); }
}
