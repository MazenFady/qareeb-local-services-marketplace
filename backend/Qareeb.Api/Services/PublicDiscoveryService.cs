using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Qareeb.Api.Data;
using Qareeb.Api.Domain;

namespace Qareeb.Api.Services;

public sealed record PublicCategory(string Id, string NameEn, string NameAr, string Icon, int Count);
public sealed record PublicService(string Id, string TitleEn, string TitleAr, string DescEn, string DescAr,
    decimal Price, string Currency, int Duration, string CategorySlug, string CategoryEn, string CategoryAr);
public sealed record PublicWorkingHour(int Day, string OpensAt, string ClosesAt);
public sealed record PublicGallery(string Type, string Url, string CaptionEn, string CaptionAr);
public sealed record PublicStaff(string Id, string NameEn, string NameAr);
public sealed record PublicReview(string AuthorEn, string AuthorAr, string DateEn, string DateAr,
    int Rating, string TextEn, string TextAr, string ReplyEn, string ReplyAr);
public sealed record PublicProvider(
    string Id, string NameEn, string NameAr, string BioEn, string BioAr,
    string HeroImage, string AvatarImage,
    string NeighborhoodEn, string NeighborhoodAr, string AddressEn, string AddressAr,
    string DistanceEn, string DistanceAr, string NextAvailableSlotEn, string NextAvailableSlotAr,
    string PriceTier, decimal StartingPrice, string Currency, double Rating, int ReviewsCount,
    string[] Badges, string[] Categories,
    string Phone, string WhatsApp, string Instagram, string Facebook,
    List<PublicService> Services, List<PublicGallery> Gallery, List<PublicWorkingHour> Hours,
    List<PublicStaff> Staff, List<PublicReview> Reviews);

public sealed record PublicSearchQuery(
    string? Query = null, string? Location = null, string? Category = null,
    string? PriceTier = null, double? MinRating = null, string? Availability = null,
    string? SortBy = null);

/// <summary>
/// Anonymous catalog reads. Every record is gated on approval, an active verified
/// owner, and non-vacation mode; rejected and pending applications never appear.
/// </summary>
public sealed class PublicDiscoveryService(QareebDbContext db, TimeProvider clock)
{
    private static readonly Dictionary<string, string> Icons = new(StringComparer.OrdinalIgnoreCase)
    {
        ["barber"] = "💈", ["hair"] = "✂️", ["nails"] = "💅", ["spa"] = "🌿",
        ["facial"] = "✨", ["doctors"] = "🩺", ["makeup"] = "💄", ["other"] = "📍"
    };

    public async Task<List<PublicCategory>> CategoriesAsync()
    {
        var providers = await PublicRowsAsync();
        var ids = providers.Select(x => x.Provider.Id).ToList();
        var services = await ActiveServicesAsync(ids);
        var categories = await db.Categories.AsNoTracking().OrderBy(x => x.NameEn).ToListAsync();
        return categories.Select(c => new PublicCategory(
            c.Slug, c.NameEn, c.NameAr,
            Icons.GetValueOrDefault(c.Slug, "📍"),
            services.Where(s => s.CategoryId == c.Id).Select(s => s.ProviderId).Distinct().Count())).ToList();
    }

    public async Task<List<PublicProvider>> SearchAsync(PublicSearchQuery query)
    {
        var rows = await PublicRowsAsync();
        if (rows.Count == 0) return [];
        var ids = rows.Select(x => x.Provider.Id).ToList();
        var services = await ActiveServicesAsync(ids);
        var hours = await db.Hours.AsNoTracking().Where(x => ids.Contains(x.ProviderId)).ToListAsync();
        var locations = await db.Locations.AsNoTracking().Where(x => ids.Contains(x.ProviderId)).ToListAsync();
        var staff = await db.Staff.AsNoTracking().Where(x => ids.Contains(x.ProviderId) && x.IsActive).ToListAsync();
        var reviewRows = await (from r in db.Reviews.AsNoTracking()
                                join a in db.Appointments.AsNoTracking() on r.AppointmentId equals a.Id
                                where ids.Contains(a.ProviderId) && !r.IsHidden
                                select new ReviewRow(a.ProviderId, r)).ToListAsync();
        var authorIds = reviewRows.Select(x => x.Review.AuthorId).Distinct().ToList();
        var authors = await db.Users.AsNoTracking().Where(x => authorIds.Contains(x.Id))
            .Select(x => new { x.Id, x.DisplayName, x.UserName })
            .ToDictionaryAsync(x => x.Id, x => x.DisplayName ?? x.UserName ?? "");

        var result = rows.Select(row => Map(row.Provider, row.OwnerName, services, hours, locations, staff, reviewRows, authors)).ToList();

        if (!string.IsNullOrWhiteSpace(query.Query))
        {
            var q = query.Query.Trim();
            result = result.Where(p =>
                Contains(p.NameEn, q) || Contains(p.NameAr, q) ||
                p.Services.Any(s => Contains(s.TitleEn, q) || Contains(s.TitleAr, q))).ToList();
        }
        if (!string.IsNullOrWhiteSpace(query.Location))
        {
            var loc = query.Location.Trim();
            result = result.Where(p => Contains(p.NeighborhoodEn, loc) || Contains(p.NeighborhoodAr, loc) ||
                Contains(p.AddressEn, loc) || Contains(p.AddressAr, loc)).ToList();
        }
        if (!string.IsNullOrWhiteSpace(query.Category) && query.Category != "all")
            result = result.Where(p => p.Categories.Contains(query.Category, StringComparer.OrdinalIgnoreCase)).ToList();
        if (!string.IsNullOrWhiteSpace(query.PriceTier) && query.PriceTier != "all")
            result = result.Where(p => p.PriceTier == query.PriceTier).ToList();
        if (query.MinRating is > 0)
            result = result.Where(p => p.Rating >= query.MinRating.Value).ToList();
        if (query.Availability == "today")
            result = result.Where(p => p.Badges.Contains("availableToday")).ToList();

        return query.SortBy switch
        {
            "rating" => result.OrderByDescending(p => p.Rating).ThenBy(p => p.NameEn).ToList(),
            "price" => result.OrderBy(p => p.StartingPrice).ThenBy(p => p.NameEn).ToList(),
            _ => result.OrderBy(p => p.NameEn).ToList()
        };
    }

    public async Task<PublicProvider?> GetAsync(Guid id)
    {
        var all = await SearchAsync(new PublicSearchQuery());
        return all.FirstOrDefault(p => p.Id == id.ToString());
    }

    private async Task<List<(ProviderProfile Provider, string OwnerName)>> PublicRowsAsync()
    {
        var rows = await (from p in db.Providers.AsNoTracking()
                          join u in db.Users.AsNoTracking() on p.OwnerId equals u.Id
                          where p.IsApproved && !p.VacationMode && u.IsActive && u.PhoneNumberConfirmed
                          orderby p.NameEn
                          select new { Provider = p, OwnerName = u.DisplayName ?? u.UserName ?? "" }).ToListAsync();
        return rows.Select(x => (x.Provider, x.OwnerName ?? "")).ToList();
    }

    private sealed record ServiceRow(Guid ProviderId, Guid CategoryId, ProviderService Service, string Slug, string NameEn, string NameAr);
    private sealed record ReviewRow(Guid ProviderId, Review Review);

    private async Task<List<ServiceRow>> ActiveServicesAsync(List<Guid> ids) =>
        await (from s in db.Services.AsNoTracking()
               join c in db.Categories.AsNoTracking() on s.CategoryId equals c.Id
               where ids.Contains(s.ProviderId) && s.IsActive
               orderby s.Price
               select new ServiceRow(s.ProviderId, c.Id, s, c.Slug, c.NameEn, c.NameAr)).ToListAsync();

    private static bool Contains(string value, string term) =>
        !string.IsNullOrEmpty(value) && value.Contains(term, StringComparison.OrdinalIgnoreCase);

    private static string Tier(decimal price) => price < 100 ? "budget" : price < 300 ? "standard" : "premium";

    private static string Time(TimeOnly value) => value.ToString("hh:mm tt", CultureInfo.InvariantCulture);

    private static List<PublicGallery> Gallery(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<PublicGallery>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? [];
        }
        catch (JsonException) { return []; }
    }

    private PublicProvider Map(ProviderProfile p, string ownerName,
        List<ServiceRow> services, List<WorkingHours> hours, List<ProviderLocation> locations,
        List<ProviderStaff> staff,
        List<ReviewRow> reviewRows, Dictionary<Guid, string> authors)
    {
        var providerServices = services.Where(s => s.ProviderId == p.Id)
            .Select(s => new PublicService(
                s.Service.Id.ToString(), s.Service.TitleEn, s.Service.TitleAr,
                "", "", s.Service.Price, s.Service.Currency, s.Service.DurationMinutes,
                s.Slug, s.NameEn, s.NameAr))
            .ToList();
        var location = locations.FirstOrDefault(x => x.ProviderId == p.Id);
        var today = clock.GetUtcNow().UtcDateTime.DayOfWeek;
        var providerHours = hours.Where(x => x.ProviderId == p.Id)
            .GroupBy(x => x.Day)
            .OrderBy(g => g.Key)
            .Select(g => new PublicWorkingHour((int)g.Key, Time(g.Min(x => x.OpensAt)), Time(g.Max(x => x.ClosesAt))))
            .ToList();
        var availableToday = hours.Any(x => x.ProviderId == p.Id && x.Day == today);
        var providerReviews = reviewRows.Where(x => x.ProviderId == p.Id)
            .Select(x => x.Review).ToList();
        var reviews = providerReviews.Select(r => new PublicReview(
            authors.GetValueOrDefault(r.AuthorId, ownerName), authors.GetValueOrDefault(r.AuthorId, ownerName),
            r.CreatedAt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            r.CreatedAt.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            r.Rating, r.Body, r.Body, r.ProviderReply ?? "", r.ProviderReply ?? "")).ToList();
        var rating = providerReviews.Count == 0 ? 0 : Math.Round(providerReviews.Average(x => x.Rating), 1);
        var startingPrice = providerServices.Count == 0 ? 0 : providerServices.Min(x => x.Price);
        var opening = hours.Where(x => x.ProviderId == p.Id && x.Day == today)
            .OrderBy(x => x.OpensAt).Select(x => Time(x.OpensAt)).FirstOrDefault();
        var badges = new List<string>();
        if (availableToday) badges.Add("availableToday");
        if (providerServices.Any(x => x.Duration <= 60)) badges.Add("instant");
        if (rating >= 4.7) badges.Add("topRated");
        var addressEn = location?.AddressEn ?? "";
        var addressAr = location?.AddressAr ?? "";
        var slotEn = p.NextAvailableSlotEn ?? (opening is null ? "See profile" : "Today " + opening);
        var slotAr = p.NextAvailableSlotAr ?? (opening is null ? "انظر الملف" : "اليوم " + opening);

        return new PublicProvider(
            p.Id.ToString(), p.NameEn, p.NameAr, p.BioEn, p.BioAr,
            p.HeroImageUrl ?? "", p.AvatarImageUrl ?? "",
            p.NeighborhoodEn ?? addressEn, p.NeighborhoodAr ?? addressAr, addressEn, addressAr,
            p.DistanceEn ?? "", p.DistanceAr ?? "", slotEn, slotAr,
            Tier(startingPrice), startingPrice, providerServices.FirstOrDefault()?.Currency ?? "EGP",
            rating, reviews.Count, badges.ToArray(),
            providerServices.Select(x => x.CategorySlug).Distinct().ToArray(),
            p.ContactPhone ?? "", p.WhatsAppNumber ?? "", p.InstagramHandle ?? "", p.FacebookPage ?? "",
            providerServices, Gallery(p.GalleryJson), providerHours,
            staff.Where(x => x.ProviderId == p.Id)
                .Select(x => new PublicStaff(x.Id.ToString(), x.NameEn, x.NameAr)).ToList(),
            reviews);
    }
}
