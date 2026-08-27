using Microsoft.EntityFrameworkCore;
using Pomo.Auth;
using Pomo.Data;
using Pomo.Endpoints;

var builder = WebApplication.CreateBuilder(args);

/*
  The frontend dev server runs on 3000 (see frontend/vite.config.ts) and proxies
  /api here, so CORS isn't exercised locally. It's configured anyway so the first
  deploy to separate origins doesn't fail mysteriously. Origins come from config
  rather than being hardcoded, and AllowAnyOrigin is deliberately not used.
*/
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var connectionString =
    builder.Configuration.GetConnectionString("Pomo")
    ?? throw new InvalidOperationException(
        "No 'Pomo' connection string. Set it in appsettings.Development.json, or "
        + "for anything secret use: dotnet user-secrets set ConnectionStrings:Pomo \"...\"");

builder.Services.AddDbContext<PomoDbContext>(options => options
    .UseNpgsql(connectionString)
    // Postgres is case-sensitive about quoted identifiers, and EF's default
    // PascalCase would force double quotes on every hand-written query. Snake
    // case keeps psql pleasant.
    .UseSnakeCaseNamingConvention());

/*
  Who is the caller? There is no auth yet (backlog cards 2 and 7), so in
  development every request resolves to one fixed local account.

  This is a hard failure outside Development rather than a silent fallback. A
  stand-in that authenticates nobody must never be the thing running in
  production because someone forgot to replace it.
*/
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddScoped<ICurrentUser, DevCurrentUser>();
}
else
{
    throw new InvalidOperationException(
        "No real ICurrentUser implementation is registered. Pomo has no "
        + "authentication yet, so it must not run outside Development. Implement "
        + "ICurrentUser against the authenticated principal first (backlog card 7).");
}

builder.Services.AddOpenApi();

var app = builder.Build();

app.UseCors("Frontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // Only redirect in production: forcing HTTPS locally breaks the Vite proxy,
    // which talks to the http profile on port 5099.
    app.UseHttpsRedirection();
}

/*
  Health check. Hosts need an endpoint that proves the process is up *and* can
  reach its database — a 200 that doesn't touch the database will happily report
  healthy while every real request fails.
*/
app.MapGet("/api/health", async (PomoDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();
    return canConnect
        ? Results.Ok(new { status = "healthy", database = "connected" })
        : Results.Json(
            new { status = "degraded", database = "unreachable" },
            statusCode: StatusCodes.Status503ServiceUnavailable);
})
.WithName("GetHealth");

app.MapStateEndpoints();

app.Run();
