using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Qareeb.Api.Domain;

namespace Qareeb.Api.Data;

public static class DevelopmentSeed
{
    public static readonly Guid ProviderId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid CustomerId = Guid.Parse("20000000-0000-0000-0000-000000000001");
    public static readonly Guid OwnerId = Guid.Parse("20000000-0000-0000-0000-000000000002");
    public static readonly Guid LocationId = Guid.Parse("30000000-0000-0000-0000-000000000001");
    public static readonly Guid StaffId = Guid.Parse("40000000-0000-0000-0000-000000000001");
    public static readonly Guid ServiceId = Guid.Parse("50000000-0000-0000-0000-000000000001");

    public static async Task RunAsync(QareebDbContext db)
    {
        // Safe rerun: never updates an existing catalog or accounts.
        if (await db.Providers.AnyAsync(x => x.Id == ProviderId)) return;
        await using var transaction = await db.Database.BeginTransactionAsync();
        foreach (var roleName in new[] { Roles.Customer, Roles.Provider, Roles.Admin })
            if (!await db.Roles.AnyAsync(r => r.NormalizedName == roleName.ToUpperInvariant()))
                db.Roles.Add(new IdentityRole<Guid>(roleName) { Id = Guid.NewGuid(), NormalizedName = roleName.ToUpperInvariant() });
        // No password, contact details, login tokens or admin assignment.
        db.Users.AddRange(
            new AppUser { Id = CustomerId, UserName = "fixture-customer", NormalizedUserName = "FIXTURE-CUSTOMER", DisplayName = "Fictional customer / عميل تجريبي", IsActive = false },
            new AppUser { Id = OwnerId, UserName = "fixture-provider", NormalizedUserName = "FIXTURE-PROVIDER", DisplayName = "Fictional provider / مزود تجريبي", IsActive = false });
        var categories = new[]
        {
            ("barber", "Barbershops & Grooming", "صالونات الحلاقة والعناية الرجالية"),
            ("hair", "Hair Salons & Styling", "صالونات الشعر والتصفيف"),
            ("nails", "Nails & Pedicure", "الأظافر والبديكير"),
            ("spa", "Spa & Massage Therapy", "السبا والتدليك العلاجي"),
            ("facial", "Skincare & Laser Centers", "العناية بالبشرة ومراكز الليزر"),
            ("doctors", "Doctors & Medical Clinics", "أطباء وعيادات طبية"),
            ("makeup", "Bridal & Makeup", "المكياج وإطلالات المناسبات"),
            ("other", "Other Local Services", "خدمات محلية أخرى")
        }.Select(x => new Category { Slug = x.Item1, NameEn = x.Item2, NameAr = x.Item3 }).ToList();
        db.Categories.AddRange(categories);
        var category = categories[0];
        db.Providers.Add(new ProviderProfile
        {
            Id = ProviderId, OwnerId = OwnerId, NameEn = "Royal Fade — fictional development venue",
            NameAr = "الرويال فيد — صالون تطوير تجريبي", IsApproved = true,
            BioEn = "Synthetic catalog inspired by the prototype.", BioAr = "بيانات تجريبية مستوحاة من النموذج الأولي.",
            HeroImageUrl = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
            AvatarImageUrl = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=240&q=80",
            GalleryJson = "[{\"type\":\"venue\",\"url\":\"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80\",\"captionEn\":\"Studio interior\",\"captionAr\":\"داخل الصالون\"}]",
            NeighborhoodEn = "Heliopolis, Cairo", NeighborhoodAr = "مصر الجديدة، القاهرة",
            DistanceEn = "2.4 km away", DistanceAr = "على بعد 2.4 كم",
            NextAvailableSlotEn = "Today 9:00 AM", NextAvailableSlotAr = "اليوم 9:00 ص",
            ContactPhone = "+20 100 000 0100", WhatsAppNumber = "+20 100 000 0100",
            InstagramHandle = "@royalfade_demo", FacebookPage = "Royal Fade Demo"
        });
        db.Locations.Add(new ProviderLocation { Id = LocationId, ProviderId = ProviderId,
            AddressEn = "Fictional location, Cairo", AddressAr = "عنوان تجريبي، القاهرة", TimeZoneId = "Africa/Cairo" });
        db.Staff.Add(new ProviderStaff { Id = StaffId, ProviderId = ProviderId, NameEn = "Demo specialist", NameAr = "أخصائي تجريبي" });
        db.Services.Add(new ProviderService { Id = ServiceId, ProviderId = ProviderId, CategoryId = category.Id,
            TitleEn = "Signature Executive Haircut", TitleAr = "قصة الشعر الملكية الخاصة", Price = 200, DurationMinutes = 45 });
        foreach (var day in Enum.GetValues<DayOfWeek>())
            db.Hours.Add(new WorkingHours { ProviderId = ProviderId, LocationId = LocationId, StaffId = StaffId,
                Day = day, OpensAt = new TimeOnly(9, 0), ClosesAt = new TimeOnly(20, 0) });
        await db.SaveChangesAsync();
        var roles = await db.Roles.ToListAsync();
        db.UserRoles.AddRange(
            new IdentityUserRole<Guid> { UserId = CustomerId, RoleId = roles.Single(r => r.Name == Roles.Customer).Id },
            new IdentityUserRole<Guid> { UserId = OwnerId, RoleId = roles.Single(r => r.Name == Roles.Provider).Id });
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}
