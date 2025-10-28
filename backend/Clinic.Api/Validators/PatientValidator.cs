using Clinic.Api.Models;
using FluentValidation;

public class PatientValidator : AbstractValidator<Patient>
{
    public PatientValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Le prénom est obligatoire")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Le nom est obligatoire")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Phone)
            .MaximumLength(25);
    }
}
