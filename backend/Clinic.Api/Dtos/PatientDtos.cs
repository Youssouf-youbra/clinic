namespace Clinic.Api.DTOs;

// Ce qu'on renvoie au client
public record PatientDto(
    int Id,
    string FirstName,
    string LastName,
    DateOnly? BirthDate,
    string? Phone,
    string? Email,
    string? Address
);

// Ce que le client envoie pour créer un patient (pas d’Id)
public record CreatePatientDto(
    string FirstName,
    string LastName,
    DateOnly? BirthDate,
    string? Phone,
    string? Email,
    string? Address
);

// Pour la mise à jour (pas d’Id non plus)
public record UpdatePatientDto(
    string FirstName,
    string LastName,
    DateOnly? BirthDate,
    string? Phone,
    string? Email,
    string? Address
);
