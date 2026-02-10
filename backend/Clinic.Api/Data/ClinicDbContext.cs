using Clinic.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Data;

public class ClinicDbContext : IdentityDbContext<ApplicationUser>
{
    public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options) { }

    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<MedicalNote> MedicalNotes => Set<MedicalNote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Patient>(e =>
        {
            e.Property(p => p.FirstName).HasMaxLength(100).IsRequired();
            e.Property(p => p.LastName).HasMaxLength(100).IsRequired();
            e.Property(p => p.Email).HasMaxLength(200);
            e.Property(p => p.Phone).HasMaxLength(30);
        });

        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasOne(a => a.Patient)
             .WithMany(p => p.Appointments)
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(a => a.Staff)
             .WithMany()
             .HasForeignKey(a => a.StaffId)
             .OnDelete(DeleteBehavior.SetNull);

            e.Property(a => a.Date).IsRequired();
            e.Property(a => a.Reason).HasMaxLength(255);
        });

        modelBuilder.Entity<Staff>(e =>
        {
            e.ToTable("Staff");
            e.Property(s => s.Nom).HasMaxLength(80).IsRequired();
            e.Property(s => s.Prenom).HasMaxLength(80).IsRequired();
            e.Property(s => s.Role).HasMaxLength(40).IsRequired();
            e.Property(s => s.Email).HasMaxLength(120).IsRequired();
            e.HasIndex(s => s.Email).IsUnique();
        });

        modelBuilder.Entity<MedicalRecord>(e =>
        {
            e.HasOne(mr => mr.Patient)
             .WithMany(p => p.MedicalRecords)
             .HasForeignKey(mr => mr.PatientId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(mr => mr.Allergies).HasMaxLength(120);
            e.Property(mr => mr.BloodType).HasMaxLength(120);
            e.Property(mr => mr.ChronicDiseases).HasMaxLength(500);
        });

        modelBuilder.Entity<MedicalNote>(e =>
        {
            e.HasOne(n => n.MedicalRecord)
             .WithMany(mr => mr.Notes)
             .HasForeignKey(n => n.MedicalRecordId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(n => n.Staff)
             .WithMany()
             .HasForeignKey(n => n.StaffId)
             .OnDelete(DeleteBehavior.SetNull);

            e.Property(n => n.Content).HasMaxLength(2000).IsRequired();
        });
    }
}
