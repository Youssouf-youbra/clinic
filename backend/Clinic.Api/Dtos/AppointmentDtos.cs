namespace Clinic.Api.DTOs;

public record AppointmentDto(
    int Id,
    int PatientId,
    DateTime Date,
    string? Reason
);

public record CreateAppointmentDto(
    int PatientId,
    DateTime Date,
    string? Reason
);

public record UpdateAppointmentDto(
    DateTime Date,
    string? Reason
);
