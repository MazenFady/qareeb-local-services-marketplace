using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Qareeb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class PreventAppointmentOverlap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TRIGGER [TR_Appointments_NoOverlap] ON [Appointments]
                AFTER INSERT, UPDATE AS
                BEGIN
                    SET NOCOUNT ON;
                    IF EXISTS (
                        SELECT 1 FROM inserted i
                        JOIN [Appointments] a WITH (UPDLOCK, HOLDLOCK)
                          ON a.ProviderId = i.ProviderId AND a.StaffId = i.StaffId
                         AND a.Id <> i.Id
                         AND a.StartsAt < i.EndsAt AND a.EndsAt > i.StartsAt
                        WHERE i.Status IN ('Pending', 'Confirmed')
                          AND a.Status IN ('Pending', 'Confirmed')
                    )
                        THROW 51000, 'Overlapping active appointment.', 1;
                END
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Destructive rollback is disabled. Use a reviewed forward migration.");
        }
    }
}
