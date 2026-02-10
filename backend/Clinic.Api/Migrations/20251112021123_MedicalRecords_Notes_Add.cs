using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinic.Api.Migrations
{
    /// <inheritdoc />
    public partial class MedicalRecords_Notes_Add : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChronicConditions",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "MedicalNotes");

            migrationBuilder.AlterColumn<string>(
                name: "BloodType",
                table: "MedicalRecords",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Allergies",
                table: "MedicalRecords",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChronicDiseases",
                table: "MedicalRecords",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "MedicalNotes",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChronicDiseases",
                table: "MedicalRecords");

            migrationBuilder.AlterColumn<string>(
                name: "BloodType",
                table: "MedicalRecords",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Allergies",
                table: "MedicalRecords",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(120)",
                oldMaxLength: 120,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChronicConditions",
                table: "MedicalRecords",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                table: "MedicalNotes",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "MedicalNotes",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
