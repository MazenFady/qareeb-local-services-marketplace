using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Qareeb.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class ProviderApplicationReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReviewNote",
                table: "Providers",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ReviewedAt",
                table: "Providers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReviewedById",
                table: "Providers",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Forward-only local migrations: reviewed provider review state is not dropped.
            throw new NotSupportedException("Use a reviewed forward migration; provider review state is not removed.");
        }
    }
}
