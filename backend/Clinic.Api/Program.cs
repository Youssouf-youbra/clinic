using Clinic.Api.Data;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1) DB: PostgreSQL via connection string "Default"
builder.Services.AddDbContext<ClinicDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// 2) API + Swagger
builder.Services.AddControllers();

// 2.1) FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3) CORS pour le front React (port Vite par défaut)
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173")
     .AllowAnyHeader()
     .AllowAnyMethod()
));

var app = builder.Build();

// 4) Migration auto (dev seulement)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ClinicDbContext>();
    db.Database.Migrate();
}

// 5) Middlewares
app.UseSwagger();
app.UseSwaggerUI();

// ⚠️ Désactivé car tu n’as pas de port HTTPS configuré
// app.UseHttpsRedirection();

app.UseCors();
app.UseAuthorization();

app.MapControllers();

app.Run();
