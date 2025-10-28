using Clinic.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Data;

public class ClinicDbContext(DbContextOptions<ClinicDbContext> options) : DbContext(options)
{
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Appointment> Appointments => Set<Appointment>(); // ✅
    public DbSet<Staff> Staff => Set<Staff>();                    // ✅ AJOUT

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Patient
        modelBuilder.Entity<Patient>(e =>
        {
            e.Property(p => p.FirstName).HasMaxLength(100).IsRequired();
            e.Property(p => p.LastName).HasMaxLength(100).IsRequired();
            e.Property(p => p.Email).HasMaxLength(200);
            e.Property(p => p.Phone).HasMaxLength(30);
        });

        // Appointment
        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasOne(a => a.Patient)
             .WithMany(p => p.Appointments)
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.Cascade);

            e.Property(a => a.Date).IsRequired();
            e.Property(a => a.Reason).HasMaxLength(255);
        });

        // Staff  ✅
        modelBuilder.Entity<Staff>(e =>
        {
            e.ToTable("Staff");
            e.Property(s => s.Nom).HasMaxLength(80).IsRequired();
            e.Property(s => s.Prenom).HasMaxLength(80).IsRequired();
            e.Property(s => s.Role).HasMaxLength(40).IsRequired();
            e.Property(s => s.Email).HasMaxLength(120).IsRequired();
            e.HasIndex(s => s.Email).IsUnique();
        });
    }
}
