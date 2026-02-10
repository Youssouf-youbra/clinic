using System.Text;
using Clinic.Api.Data;
using Clinic.Api.Models;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ======================================================
// 1) DATABASE (PostgreSQL)
// ======================================================
builder.Services.AddDbContext<ClinicDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
);

// ======================================================
// 2) IDENTITY (Users + Roles)
// ======================================================
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ClinicDbContext>()
.AddDefaultTokenProviders();

// ======================================================
// 3) JWT AUTHENTICATION
// ======================================================
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
var jwtIssuer = jwtSection["Issuer"] ?? "ClinicApi";
var jwtAudience = jwtSection["Audience"] ?? jwtIssuer;

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // true en prod
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// ======================================================
// 4) CONTROLLERS + VALIDATION
// ======================================================
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// ======================================================
// 5) SWAGGER + JWT (FIX 401)
// ======================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Clinic.Api",
        Version = "v1"
    });

    // 🔐 Définition Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez : Bearer {votre_token_jwt}"
    });

    // 🔐 Application globale du Bearer (OBLIGATOIRE)
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ======================================================
// 6) CORS
// ======================================================
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:3000")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()
));

// ======================================================
// BUILD APP
// ======================================================
var app = builder.Build();

// ======================================================
// 7) MIGRATIONS + SEED (DEV)
// ======================================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var db = services.GetRequiredService<ClinicDbContext>();
    db.Database.Migrate();

    await IdentitySeed.SeedAsync(services);
}

// ======================================================
// 8) MIDDLEWARES
// ======================================================
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

app.UseAuthentication();   // 👈 OBLIGATOIRE AVANT
app.UseAuthorization();

app.MapControllers();
app.Run();
