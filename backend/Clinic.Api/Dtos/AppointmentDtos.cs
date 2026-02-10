namespace Clinic.Api.DTOs;

public record AppointmentDto(
    int Id,
    int PatientId,
    int? StaffId,
    DateTime Date,
    string? Reason
);

public record CreateAppointmentDto(
    int PatientId,
    int? StaffId,
    DateTime Date,
    string? Reason
);

public record UpdateAppointmentDto(
    int? StaffId,
    DateTime Date,
    string? Reason
);
