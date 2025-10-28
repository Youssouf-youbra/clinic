using FluentValidation;
using Clinic.Api.DTOs;

namespace Clinic.Api.Validators;

public class CreateAppointmentValidator : AbstractValidator<CreateAppointmentDto>
{
    public CreateAppointmentValidator()
    {
        RuleFor(x => x.PatientId).GreaterThan(0);
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Reason).MaximumLength(255);
    }
}

public class UpdateAppointmentValidator : AbstractValidator<UpdateAppointmentDto>
{
    public UpdateAppointmentValidator()
    {
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Reason).MaximumLength(255);
    }
}
