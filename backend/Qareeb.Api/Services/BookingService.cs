using System.Data;
using Microsoft.EntityFrameworkCore;
using Qareeb.Api.Data;
using Qareeb.Api.Domain;

namespace Qareeb.Api.Services;

public record CreateAppointment(Guid ProviderId, Guid LocationId, Guid StaffId, Guid[] ServiceIds, DateTimeOffset StartsAt);
public class BookingConflictException(string message) : Exception(message);
public class BookingValidationException(string message) : Exception(message);

public class BookingService(QareebDbContext db, TimeProvider clock)
{
    public async Task<Appointment> CreateAsync(Guid customerId, CreateAppointment request, CancellationToken ct = default)
    {
        if (request.ServiceIds is not { Length: > 0 and <= 20 } || request.ServiceIds.Distinct().Count() != request.ServiceIds.Length
            || request.StartsAt <= clock.GetUtcNow() || request.StartsAt > clock.GetUtcNow().AddDays(180))
            throw new BookingValidationException("Select unique services and a future appointment within 180 days.");
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        // Transaction-owned lock works across API processes. All creation paths use it.
        var resource = $"qareeb:booking:{request.ProviderId}";
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            DECLARE @result int;
            EXEC @result = sys.sp_getapplock @Resource={resource}, @LockMode='Exclusive',
                @LockOwner='Transaction', @LockTimeout=10000;
            IF @result < 0 THROW 51001, 'Booking lock unavailable; retry.', 1;
            """, ct);
        if (!await db.Users.AnyAsync(x => x.Id == customerId && x.IsActive, ct))
            throw new BookingValidationException("An active customer account is required.");
        var customerRole = await (from ur in db.UserRoles join role in db.Roles on ur.RoleId equals role.Id
                                  where ur.UserId == customerId && role.Name == Roles.Customer select ur).AnyAsync(ct);
        if (!customerRole) throw new BookingValidationException("Customer permission is required.");
        var provider = await db.Providers.SingleOrDefaultAsync(x => x.Id == request.ProviderId, ct);
        if (provider is null || !provider.IsApproved || provider.VacationMode)
            throw new BookingConflictException("Provider is not accepting bookings.");
        var location = await db.Locations.SingleOrDefaultAsync(x => x.Id == request.LocationId && x.ProviderId == request.ProviderId, ct);
        if (location is null || !await db.Staff.AnyAsync(x => x.Id == request.StaffId && x.ProviderId == request.ProviderId && x.IsActive, ct))
            throw new BookingValidationException("Select a location and active staff member belonging to this provider.");
        var services = await db.Services.Where(x => request.ServiceIds.Contains(x.Id) && x.ProviderId == request.ProviderId && x.IsActive).ToListAsync(ct);
        if (services.Count != request.ServiceIds.Length || services.Select(x => x.Currency).Distinct().Count() != 1)
            throw new BookingValidationException("Services must be active, from this provider, and use one currency.");
        var start = request.StartsAt.ToUniversalTime();
        var end = start.AddMinutes(services.Sum(x => x.DurationMinutes));
        var zone = TimeZoneInfo.FindSystemTimeZoneById(location.TimeZoneId);
        var localStart = TimeZoneInfo.ConvertTime(start, zone);
        var localEnd = TimeZoneInfo.ConvertTime(end, zone);
        var hours = await db.Hours.SingleOrDefaultAsync(x => x.StaffId == request.StaffId && x.LocationId == request.LocationId && x.Day == localStart.DayOfWeek, ct);
        if (hours is null || localStart.Date != localEnd.Date
            || TimeOnly.FromDateTime(localStart.DateTime) < hours.OpensAt || TimeOnly.FromDateTime(localEnd.DateTime) > hours.ClosesAt)
            throw new BookingConflictException("Appointment is outside working hours.");
        if (await db.AvailabilityExceptions.AnyAsync(x => x.StaffId == request.StaffId && x.StartsAt < end && x.EndsAt > start, ct)
            || await db.Appointments.AnyAsync(x => x.ProviderId == request.ProviderId && x.StaffId == request.StaffId
                && (x.Status == BookingStatus.Pending || x.Status == BookingStatus.Confirmed)
                && x.StartsAt < end && x.EndsAt > start, ct))
            throw new BookingConflictException("Staff member is unavailable for this interval.");
        var appointment = new Appointment
        {
            CustomerId = customerId, ProviderId = request.ProviderId, LocationId = request.LocationId, StaffId = request.StaffId,
            StartsAt = start, EndsAt = end, TotalPrice = services.Sum(x => x.Price), Currency = services[0].Currency,
            Services = services.Select(x => new AppointmentService { ProviderId = x.ProviderId, ServiceId = x.Id,
                TitleEn = x.TitleEn, TitleAr = x.TitleAr, Price = x.Price, DurationMinutes = x.DurationMinutes }).ToList()
        };
        db.Appointments.Add(appointment);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return appointment;
    }
}
