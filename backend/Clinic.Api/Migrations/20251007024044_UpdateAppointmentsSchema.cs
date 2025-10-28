using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinic.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppointmentsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointment_Patients_PatientId",
                table: "Appointment");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Appointment",
                table: "Appointment");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Appointment");

            migrationBuilder.RenameTable(
                name: "Appointment",
                newName: "Appointments");

            migrationBuilder.RenameColumn(
                name: "ScheduledAt",
                table: "Appointments",
                newName: "Date");

            migrationBuilder.RenameIndex(
                name: "IX_Appointment_PatientId",
                table: "Appointments",
                newName: "IX_Appointments_PatientId");

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "Appointments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Appointments",
                table: "Appointments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Patients_PatientId",
                table: "Appointments",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Patients_PatientId",
                table: "Appointments");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Appointments",
                table: "Appointments");

            migrationBuilder.RenameTable(
                name: "Appointments",
                newName: "Appointment");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Appointment",
                newName: "ScheduledAt");

            migrationBuilder.RenameIndex(
                name: "IX_Appointments_PatientId",
                table: "Appointment",
                newName: "IX_Appointment_PatientId");

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "Appointment",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Appointment",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Appointment",
                table: "Appointment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointment_Patients_PatientId",
                table: "Appointment",
                column: "PatientId",
                principalTable: "Patients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
